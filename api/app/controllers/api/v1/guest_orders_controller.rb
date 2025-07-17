class Api::V1::GuestOrdersController < ApplicationController
  # Guest checkout - no authentication required

  # POST /api/v1/guest/orders
  def create
    # Validate required parameters
    unless guest_order_params[:email].present?
      return render json: { error: 'Email is required' }, status: :unprocessable_entity
    end

    unless guest_order_params[:cart_items].present? && guest_order_params[:cart_items].any?
      return render json: { error: 'Cart items are required' }, status: :unprocessable_entity
    end

    # Validate shipping address
    shipping_address = guest_order_params[:shipping_address]
    billing_address = guest_order_params[:billing_address] || shipping_address
    
    Rails.logger.info "Guest order params: #{guest_order_params.inspect}"
    Rails.logger.info "Shipping address: #{shipping_address.inspect}"
    
    unless valid_address?(shipping_address)
      Rails.logger.error "Invalid shipping address: #{shipping_address.inspect}"
      return render json: { error: 'Invalid shipping address' }, status: :unprocessable_entity
    end

    # Find or create guest user
    guest_user = find_or_create_guest_user(guest_order_params[:email])

    # Validate cart items and check inventory
    cart_items = guest_order_params[:cart_items]
    insufficient_items = []
    
    cart_items.each do |item_data|
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

    if insufficient_items.any?
      return render json: { 
        error: 'Insufficient inventory for some items',
        insufficient_items: insufficient_items 
      }, status: :unprocessable_entity
    end

    begin
      # Group cart items by store since each store needs a separate order
      items_by_store = cart_items.group_by do |item_data|
        Product.find(item_data[:product_id]).store
      end

      orders = items_by_store.map do |store, items|
        ActiveRecord::Base.transaction do
          order = Order.create!(
            user: guest_user,
            store: store,
            shipping_address: shipping_address,
            billing_address: billing_address,
            payment_method: guest_order_params[:payment_method],
            status: 'pending',
            payment_status: 'pending'
          )

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
                images: product.images
              }
            )
          end

          order.send(:calculate_totals)
          order.save!
          order
        end
      end

      render json: OrderSerializer.new(
        orders, 
        include: ['store', 'order_items', 'order_items.product']
      ), status: :created

    rescue ActiveRecord::RecordInvalid => e
      render json: { error: e.message }, status: :unprocessable_entity
    end
  end

  # GET /api/v1/guest/orders/:order_number
  def show
    order = Order.find_by(order_number: params[:order_number])
    
    unless order
      return render json: { error: 'Order not found' }, status: :not_found
    end

    # Verify email matches (simple security for guest orders)
    unless params[:email].present? && order.user.email == params[:email]
      return render json: { error: 'Invalid credentials' }, status: :unauthorized
    end

    render json: OrderSerializer.new(
      order, 
      include: ['store', 'order_items', 'order_items.product']
    )
  end

  private

  def guest_order_params
    params.require(:guest_order).permit(
      :email,
      :payment_method,
      shipping_address: [:firstName, :lastName, :email, :phone, :address1, :address2, :city, :state, :zipCode, :country],
      billing_address: [:firstName, :lastName, :email, :phone, :address1, :address2, :city, :state, :zipCode, :country],
      cart_items: [:product_id, :quantity]
    )
  end

  def valid_address?(address)
    return false unless address.is_a?(Hash)
    
    # Convert to HashWithIndifferentAccess to handle both string and symbol keys
    address = address.with_indifferent_access if address.respond_to?(:with_indifferent_access)
    
    required_fields = %w[firstName lastName email address1 city state zipCode country]
    missing_fields = required_fields.select { |field| address[field].blank? }
    
    if missing_fields.any?
      Rails.logger.error "Missing required address fields: #{missing_fields.join(', ')}"
      Rails.logger.error "Address keys present: #{address.keys.join(', ')}"
      return false
    end
    
    true
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
end