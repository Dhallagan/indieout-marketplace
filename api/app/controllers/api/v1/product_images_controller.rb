class Api::V1::ProductImagesController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_seller!
  before_action :set_product
  before_action :ensure_product_owner!
  before_action :set_product_image, only: [:show, :update, :destroy, :set_primary]

  # GET /api/v1/products/:product_id/images
  def index
    @product_images = @product.product_images.ordered
    render json: ProductImageSerializer.new(@product_images).serializable_hash
  end

  # GET /api/v1/products/:product_id/images/:id
  def show
    render json: ProductImageSerializer.new(@product_image).serializable_hash
  end

  # POST /api/v1/products/:product_id/images
  def create
    @product_image = @product.product_images.build(
      alt_text: params[:alt_text]
    )
    
    # Simply attach the file - Shrine handles everything
    if params[:file].present?
      @product_image.image = params[:file]
    else
      render json: {
        success: false,
        error: 'No file provided'
      }, status: :bad_request
      return
    end
    
    if @product_image.save
      render json: ProductImageSerializer.new(@product_image).serializable_hash
    else
      render json: {
        success: false,
        errors: @product_image.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/products/:product_id/images/:id
  def update
    update_params = {}
    update_params[:alt_text] = params[:alt_text] if params.has_key?(:alt_text)
    update_params[:position] = params[:position] if params.has_key?(:position)
    
    # Handle position change
    if params.has_key?(:position)
      new_position = params[:position].to_i
      old_position = @product_image.position
      
      if new_position != old_position
        # Reorder other images
        if new_position < old_position
          @product.product_images.where('position >= ? AND position < ?', new_position, old_position)
                                 .update_all('position = position + 1')
        else
          @product.product_images.where('position > ? AND position <= ?', old_position, new_position)
                                 .update_all('position = position - 1')
        end
      end
    end
    
    if @product_image.update(update_params)
      render json: ProductImageSerializer.new(@product_image).serializable_hash
    else
      render json: {
        success: false,
        errors: @product_image.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/products/:product_id/images/:id
  def destroy
    position = @product_image.position
    
    if @product_image.destroy
      # Reorder remaining images to close gaps
      @product.product_images.where('position > ?', position)
                             .update_all('position = position - 1')
      
      render json: { 
        success: true,
        message: 'Image deleted successfully' 
      }, status: :ok
    else
      render json: {
        success: false,
        errors: ['Failed to delete image']
      }, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/products/:product_id/images/reorder
  def reorder
    unless params[:image_ids].is_a?(Array)
      render json: {
        success: false,
        error: 'image_ids must be an array'
      }, status: :bad_request
      return
    end
    
    ActiveRecord::Base.transaction do
      params[:image_ids].each_with_index do |image_id, index|
        @product.product_images.find(image_id).update!(position: index + 1)
      end
    end
    
    render json: {
      success: true,
      message: 'Images reordered successfully'
    }
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'One or more images not found'
    }, status: :not_found
  rescue ActiveRecord::RecordInvalid => e
    render json: {
      success: false,
      errors: e.record.errors.full_messages
    }, status: :unprocessable_entity
  end

  # PATCH /api/v1/products/:product_id/images/:id/set_primary
  def set_primary
    ActiveRecord::Base.transaction do
      # Move current primary to position 2
      current_primary = @product.product_images.primary.first
      if current_primary && current_primary != @product_image
        current_primary.update!(position: 2)
      end
      
      # Set this image as primary
      @product_image.update!(position: 1)
    end
    
    render json: ProductImageSerializer.new(@product_image).serializable_hash
  rescue ActiveRecord::RecordInvalid => e
    render json: {
      success: false,
      errors: e.record.errors.full_messages
    }, status: :unprocessable_entity
  end

  private

  def set_product
    @product = current_user.store.products.find(params[:product_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product not found' }, status: :not_found
  end

  def set_product_image
    @product_image = @product.product_images.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Product image not found' }, status: :not_found
  end

  def ensure_product_owner!
    unless @product.store == current_user.store
      render json: { error: 'Access denied' }, status: :forbidden
    end
  end

  def ensure_seller!
    unless current_user&.seller_admin?
      render json: { error: 'Seller access required' }, status: :forbidden
    end
  end

end