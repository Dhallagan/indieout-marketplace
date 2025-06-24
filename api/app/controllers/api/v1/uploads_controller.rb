class Api::V1::UploadsController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_seller!

  # Upload images for products using Shrine
  def create
    unless params[:file].present?
      render json: {
        success: false,
        error: 'No file provided'
      }, status: :bad_request
      return
    end

    begin
      # Use the ImageUploader directly
      uploaded_file = ImageUploader.upload(params[:file], :store)
      
      # Create an attacher to handle derivatives
      attacher = ImageUploader::Attacher.new
      attacher.assign(uploaded_file)
      
      # Create derivatives
      attacher.create_derivatives
      
      # Get the derivatives
      derivatives = attacher.derivatives
      
      render json: {
        success: true,
        data: {
          id: uploaded_file.id,
          url: uploaded_file.url,
          derivatives: {
            thumb: derivatives[:thumb]&.url,
            medium: derivatives[:medium]&.url,
            large: derivatives[:large]&.url
          },
          metadata: uploaded_file.metadata,
          size: uploaded_file.size
        }
      }
    rescue => e
      Rails.logger.error "File upload error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      render json: {
        success: false,
        error: 'Failed to upload file'
      }, status: :internal_server_error
    end
  end

  # Upload and attach to specific product
  def create_for_product
    product = current_user.store.products.find(params[:product_id])
    
    unless params[:file].present?
      render json: {
        success: false,
        error: 'No file provided'
      }, status: :bad_request
      return
    end

    begin
      # Create ProductImage record
      product_image = product.product_images.build
      product_image.image = params[:file]
      product_image.alt_text = params[:alt_text] if params[:alt_text].present?
      
      if product_image.save
        render json: {
          success: true,
          data: serialize_product_image(product_image)
        }
      else
        render json: {
          success: false,
          error: product_image.errors.full_messages.first
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Product image upload error: #{e.message}"
      render json: {
        success: false,
        error: 'Failed to upload image'
      }, status: :internal_server_error
    end
  end

  # Delete uploaded image
  def destroy
    # For standalone uploads, we'd need to track them differently
    # For now, deletion happens through product image management
    render json: {
      success: true,
      message: 'Use product image management for deletion'
    }
  end

  private

  def serialize_product_image(product_image)
    {
      id: product_image.id,
      position: product_image.position,
      alt_text: product_image.alt_text,
      urls: {
        thumb: product_image.image_url(:thumb),
        medium: product_image.image_url(:medium),
        large: product_image.image_url(:large),
        original: product_image.image_url(:original)
      },
      dimensions: product_image.dimensions,
      primary: product_image.primary?
    }
  end

  def ensure_seller!
    unless current_user&.seller_admin?
      render json: {
        success: false,
        error: 'Seller access required'
      }, status: :forbidden
    end
  end
end