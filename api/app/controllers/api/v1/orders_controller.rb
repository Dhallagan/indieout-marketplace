class Api::V1::OrdersController < ApplicationController
  before_action :authenticate_user!, except: [:create, :show_by_number]
  before_action :set_order, only: [:show, :cancel]

  # GET /api/v1/orders
  def index
    if params[:store_orders] == 'true' && current_user.store
      # Seller viewing their store orders
      orders = current_user.store.orders.recent.includes(:user, :order_items)
    else
      # Customer viewing their own orders
      orders = current_user.orders.recent.includes(:store, :order_items)
    end
    
    # Filter by status if provided
    orders = orders.by_status(params[:status]) if params[:status].present?
    
    # Search functionality for sellers
    if params[:search].present? && params[:store_orders] == 'true'
      search_term = "%#{params[:search]}%"
      orders = orders.joins(:user).where(
        "order_number ILIKE ? OR users.email ILIKE ? OR users.first_name ILIKE ? OR users.last_name ILIKE ?",
        search_term, search_term, search_term, search_term
      )
    end
    
    # Pagination
    page = params[:page]&.to_i || 1
    per_page = params[:per_page]&.to_i || 20
    per_page = [per_page, 100].min # Max 100 per page
    
    orders = orders.limit(per_page).offset((page - 1) * per_page)
    
    if params[:store_orders] == 'true'
      # Include user info for seller view
      render json: OrderSerializer.new(
        orders, 
        include: ['user', 'order_items', 'order_items.product']
      )
    else
      # Include store info for customer view
      render json: OrderSerializer.new(
        orders, 
        include: ['store', 'order_items', 'order_items.product']
      )
    end
  end

  # GET /api/v1/orders/:id
  def show
    render json: OrderSerializer.new(
      @order, 
      include: ['store', 'order_items', 'order_items.product']
    )
  end

  # GET /api/v1/orders/by_number/:order_number
  def show_by_number
    order = Order.find_by!(order_number: params[:order_number])
    
    # Optional: Add email verification for security
    if params[:email].present? && order.user.email.downcase != params[:email].downcase
      render json: { error: 'Order not found' }, status: :not_found
      return
    end
    
    render json: OrderSerializer.new(
      order, 
      include: ['store', 'order_items', 'order_items.product']
    )
  end

  # POST /api/v1/orders
  def create
    # Handle both guest and authenticated users
    if current_user
      # Authenticated user flow - use existing cart
      cart = current_user.current_cart
      
      if cart.cart_items.empty?
        return render json: { error: 'Cart is empty' }, status: :unprocessable_entity
      end

      # Get shipping address - use provided address or default user address
      shipping_address = order_params[:shipping_address] || get_default_user_address
      billing_address = order_params[:billing_address] || shipping_address
    else
      # Guest user flow
      unless order_params[:email].present?
        return render json: { error: 'Email is required for guest checkout' }, status: :unprocessable_entity
      end

      unless order_params[:cart_items].present? && order_params[:cart_items].any?
        return render json: { error: 'Cart items are required for guest checkout' }, status: :unprocessable_entity
      end

      # Guest must provide shipping address
      shipping_address = order_params[:shipping_address]
      billing_address = order_params[:billing_address] || shipping_address
      
      Rails.logger.info "Guest checkout - order params: #{order_params.inspect}"
    end
    
    unless shipping_address && valid_address?(shipping_address)
      Rails.logger.error "Shipping address validation failed"
      Rails.logger.error "Shipping address: #{shipping_address.inspect}"
      Rails.logger.error "Valid address check: #{valid_address?(shipping_address)}"
      return render json: { error: 'Invalid shipping address' }, status: :unprocessable_entity
    end

    # Check inventory for all items
    insufficient_items = []
    
    if current_user
      # For authenticated users, check cart items
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
    else
      # For guest users, check provided cart items
      order_params[:cart_items].each do |item_data|
        product = Product.find_by(id: item_data[:product_id])
        
        unless product
          return render json: { error: "Product #{item_data[:product_id]} not found" }, status: :not_found
        end

        if product.track_inventory && product.inventory < item_data[:quantity].to_i
          insufficient_items << {
            product_id: product.id,
            product_name: product.name,
            requested: item_data[:quantity],
            available: product.inventory
          }
        end
      end
    end

    if insufficient_items.any?
      return render json: { 
        error: 'Insufficient inventory for some items',
        insufficient_items: insufficient_items 
      }, status: :unprocessable_entity
    end

    begin
      if current_user
        # Authenticated user - use existing cart
        orders = Order.create_from_cart!(
          cart,
          shipping_address,
          billing_address,
          order_params[:payment_method]
        )
      else
        # Guest user - create order directly
        guest_user = find_or_create_guest_user(order_params[:email])
        
        # Group cart items by store
        items_by_store = order_params[:cart_items].group_by do |item_data|
          Product.find(item_data[:product_id]).store
        end

        orders = items_by_store.map do |store, items|
          ActiveRecord::Base.transaction do
            order = Order.new(
              user: guest_user,
              store: store,
              shipping_address: shipping_address,
              billing_address: billing_address,
              payment_method: order_params[:payment_method],
              status: 'pending',
              payment_status: 'pending',
              subtotal: 0,
              shipping_cost: 0,
              tax_amount: 0,
              total_amount: 0
            )

            # Save order first to generate ID
            order.save!
            
            # Now add items
            items.each do |item_data|
              product = Product.find(item_data[:product_id])
              quantity = item_data[:quantity].to_i
              
              order.order_items.create!(
                product: product,
                quantity: quantity,
                unit_price: product.base_price,
                total_price: quantity * product.base_price,
                product_snapshot: {
                  name: product.name,
                  sku: product.sku,
                  description: product.description,
                  base_price: product.base_price,
                  images: product.product_images.ordered.map { |img| img.image_url(size: :medium) }
                }
              )
            end
            
            # Calculate and update totals
            order.send(:calculate_totals)
            order.save!
            order
          end
        end
      end

      if orders.any?
        # Clear the cart after successful order creation (authenticated users only)
        cart.clear! if current_user
        
        # Don't auto-confirm payment - let Stripe handle it
        
        render json: OrderSerializer.new(
          orders.map(&:reload), 
          include: ['store', 'order_items', 'order_items.product']
        ), status: :created
      else
        render json: { error: 'Failed to create orders' }, status: :unprocessable_entity
      end
    rescue StandardError => e
      # Handle inventory errors and other issues
      if e.message.include?('Insufficient inventory')
        render json: { error: e.message }, status: :unprocessable_entity
      else
        render json: { error: e.message }, status: :unprocessable_entity
      end
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

  # PATCH /api/v1/orders/:id/update_status (for store owners)
  def update_status
    @order = current_user.store&.orders&.find(params[:id])
    
    unless @order
      return render json: { error: 'Order not found' }, status: :not_found
    end

    new_status = params[:status]
    tracking_number = params[:tracking_number]

    case new_status
    when 'processing'
      if @order.update(status: 'processing')
        # Send status update email
        OrderMailer.order_status_update(@order).deliver_later
        render json: OrderSerializer.new(@order.reload)
      else
        render json: { error: 'Failed to update order status' }, status: :unprocessable_entity
      end
    when 'shipped'
      updates = { status: 'shipped', fulfilled_at: Time.current }
      updates[:tracking_number] = tracking_number if tracking_number.present?
      
      if @order.update(updates)
        # Send shipping confirmation email
        OrderMailer.shipping_confirmation(@order).deliver_later
        render json: OrderSerializer.new(@order.reload)
      else
        render json: { error: 'Failed to update order status' }, status: :unprocessable_entity
      end
    when 'delivered'
      if @order.update(status: 'delivered')
        render json: OrderSerializer.new(@order.reload)
      else
        render json: { error: 'Failed to update order status' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Invalid status' }, status: :unprocessable_entity
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
      :email,  # For guest checkout
      :payment_method,
      shipping_address: [:firstName, :lastName, :email, :phone, :address1, :address2, :city, :state, :zipCode, :country],
      billing_address: [:firstName, :lastName, :email, :phone, :address1, :address2, :city, :state, :zipCode, :country],
      cart_items: [:product_id, :quantity]  # For guest checkout
    )
  end

  def find_or_create_guest_user(email)
    # Try to find existing user by email
    user = User.find_by(email: email.downcase)
    
    if user
      return user
    end

    # Create guest user if not found
    User.create!(
      email: email.downcase,
      first_name: 'Guest',
      last_name: 'User',
      password: SecureRandom.alphanumeric(16), # Random password
      role: :consumer,
      email_verified: false # Guests are not verified
    )
  end

  def valid_address?(address)
    return false unless address.present?
    
    # Convert to hash if it's ActionController::Parameters
    address = address.to_h if address.respond_to?(:to_h)
    
    required_fields = %w[firstName lastName email address1 city state zipCode country]
    missing_fields = required_fields.select { |field| address[field].blank? }
    
    if missing_fields.any?
      Rails.logger.error "Missing required address fields: #{missing_fields.join(', ')}"
      return false
    end
    
    true
  end
end