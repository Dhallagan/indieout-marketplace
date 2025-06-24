class Api::V1::CartsController < ApplicationController
  before_action :set_cart_user

  # GET /api/v1/cart
  def show
    cart = get_or_create_cart
    render json: CartSerializer.new(cart, include: ['cart_items', 'cart_items.product'])
  end

  # POST /api/v1/cart/items
  def add_item
    cart = get_or_create_cart
    product = Product.find(params[:product_id])
    quantity = params[:quantity]&.to_i || 1

    # Check if product is in stock
    if product.track_inventory && product.inventory < quantity
      return render json: { 
        error: 'Insufficient inventory',
        available: product.inventory 
      }, status: :unprocessable_entity
    end

    cart_item = cart.add_product(product, quantity)
    cart.extend_expiration # Extend cart expiration when items are added

    if cart_item.persisted?
      response_data = CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product']).serializable_hash
      response_data[:cart_token] = cart.user.id if @cart_user.nil? # Return cart token for guest users
      render json: response_data, status: :created
    else
      render json: { errors: cart_item.errors }, status: :unprocessable_entity
    end
  end

  # PUT /api/v1/cart/items/:id
  def update_item
    cart = get_or_create_cart
    cart_item = cart.cart_items.find(params[:id])
    quantity = params[:quantity].to_i

    if quantity <= 0
      cart_item.destroy
    else
      # Check inventory
      if cart_item.product.track_inventory && cart_item.product.inventory < quantity
        return render json: { 
          error: 'Insufficient inventory',
          available: cart_item.product.inventory 
        }, status: :unprocessable_entity
      end

      cart_item.update(quantity: quantity)
    end

    render json: CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product'])
  end

  # DELETE /api/v1/cart/items/:id
  def remove_item
    cart = get_or_create_cart
    cart_item = cart.cart_items.find(params[:id])
    cart_item.destroy

    render json: CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product'])
  end

  # DELETE /api/v1/cart
  def clear
    cart = get_or_create_cart
    cart.clear!

    render json: CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product'])
  end

  private

  def set_cart_user
    @cart_user = current_user
    
    # For guest users, try to find existing guest user by cart_token
    if @cart_user.nil? && params[:cart_token].present?
      @cart_user = User.find_by(id: params[:cart_token])
    end
  end

  def get_or_create_cart
    if @cart_user
      @cart_user.current_cart
    else
      # Create temporary guest user for cart
      guest_user = create_guest_user
      guest_user.current_cart
    end
  end

  def create_guest_user
    User.create!(
      email: "guest_#{SecureRandom.hex(8)}@temp.local",
      password: SecureRandom.hex(16),
      first_name: 'Guest',
      last_name: 'User',
      role: :consumer,
      email_verified: false
    )
  end

  def cart_params
    params.permit(:product_id, :quantity, :cart_token)
  end
end