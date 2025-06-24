class Api::V1::CartsController < ApplicationController
  before_action :authenticate_request
  before_action :set_cart, only: [:show, :update, :destroy]

  # GET /api/v1/cart
  def show
    cart = current_user.current_cart
    render json: CartSerializer.new(cart, include: ['cart_items', 'cart_items.product'])
  end

  # POST /api/v1/cart/items
  def add_item
    cart = current_user.current_cart
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
      render json: CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product']), 
             status: :created
    else
      render json: { errors: cart_item.errors }, status: :unprocessable_entity
    end
  end

  # PUT /api/v1/cart/items/:id
  def update_item
    cart = current_user.current_cart
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
    cart = current_user.current_cart
    cart_item = cart.cart_items.find(params[:id])
    cart_item.destroy

    render json: CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product'])
  end

  # DELETE /api/v1/cart
  def clear
    cart = current_user.current_cart
    cart.clear!

    render json: CartSerializer.new(cart.reload, include: ['cart_items', 'cart_items.product'])
  end

  private

  def set_cart
    @cart = current_user.current_cart
  end

  def cart_params
    params.require(:cart).permit(:product_id, :quantity)
  end
end