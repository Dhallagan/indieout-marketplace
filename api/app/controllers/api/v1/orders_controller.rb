class Api::V1::OrdersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_order, only: [:show, :cancel]

  # GET /api/v1/orders
  def index
    orders = current_user.orders.recent.includes(:store, :order_items)
    
    # Filter by status if provided
    orders = orders.by_status(params[:status]) if params[:status].present?
    
    # Pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 10
    per_page = [per_page, 100].min # Max 100 per page
    
    orders = orders.limit(per_page).offset((page - 1) * per_page)
    
    render json: OrderSerializer.new(
      orders, 
      include: ['store', 'order_items', 'order_items.product']
    )
  end

  # GET /api/v1/orders/:id
  def show
    render json: OrderSerializer.new(
      @order, 
      include: ['store', 'order_items', 'order_items.product']
    )
  end

  # POST /api/v1/orders
  def create
    cart = current_user.current_cart
    
    if cart.cart_items.empty?
      return render json: { error: 'Cart is empty' }, status: :unprocessable_entity
    end

    # Get shipping address - use provided address or default user address
    shipping_address = order_params[:shipping_address] || get_default_user_address
    billing_address = order_params[:billing_address] || shipping_address
    
    unless shipping_address && valid_address?(shipping_address)
      return render json: { error: 'No valid shipping address found. Please add an address to your account.' }, status: :unprocessable_entity
    end

    # Check inventory for all items
    insufficient_items = []
    cart.cart_items.each do |item|
      if item.product.track_inventory && item.product.inventory < item.quantity
        insufficient_items << {
          product_id: item.product.id,
          product_name: item.product.name,
          requested: item.quantity,
          available: item.product.inventory
        }
      end
    end

    if insufficient_items.any?
      return render json: { 
        error: 'Insufficient inventory for some items',
        insufficient_items: insufficient_items 
      }, status: :unprocessable_entity
    end

    begin
      orders = Order.create_from_cart!(
        cart,
        shipping_address,
        billing_address,
        order_params[:payment_method]
      )

      if orders.any?
        # Clear the cart after successful order creation
        cart.clear!
        
        render json: OrderSerializer.new(
          orders, 
          include: ['store', 'order_items', 'order_items.product']
        ), status: :created
      else
        render json: { error: 'Failed to create orders' }, status: :unprocessable_entity
      end
    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/orders/:id/cancel
  def cancel
    if @order.cancel!
      render json: OrderSerializer.new(@order)
    else
      render json: { error: 'Cannot cancel this order' }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/orders/:id/fulfill (for store owners)
  def fulfill
    @order = current_user.store&.orders&.find(params[:id])
    
    unless @order
      return render json: { error: 'Order not found' }, status: :not_found
    end

    if @order.fulfill!
      render json: OrderSerializer.new(@order)
    else
      render json: { error: 'Cannot fulfill this order' }, status: :unprocessable_entity
    end
  end

  private

  def set_order
    @order = current_user.orders.find(params[:id])
  end

  def get_default_user_address
    default_address = current_user.addresses.find_by(is_default: true)
    return nil unless default_address

    # Convert Address model to the expected hash format
    {
      'firstName' => default_address.full_name.split(' ').first,
      'lastName' => default_address.full_name.split(' ')[1..].join(' '),
      'email' => current_user.email,
      'phone' => default_address.phone,
      'address1' => default_address.address_line_1,
      'address2' => default_address.address_line_2,
      'city' => default_address.city,
      'state' => default_address.state,
      'zipCode' => default_address.zip_code,
      'country' => default_address.country
    }
  end

  def order_params
    params.require(:order).permit(
      :payment_method,
      shipping_address: [:firstName, :lastName, :email, :phone, :address1, :address2, :city, :state, :zipCode, :country],
      billing_address: [:firstName, :lastName, :email, :phone, :address1, :address2, :city, :state, :zipCode, :country]
    )
  end

  def valid_address?(address)
    return false unless address.is_a?(Hash)
    
    required_fields = %w[firstName lastName email address1 city state zipCode country]
    required_fields.all? { |field| address[field].present? }
  end
end