class Api::V1::ProductsController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :ensure_seller!, except: [:index, :show]
  before_action :set_product, only: [:show, :update, :destroy]
  before_action :ensure_product_owner!, only: [:update, :destroy]

  def index
    # Public endpoint - show active products
    products = Product.includes(:store, :category, :product_variants).active
    
    # Filter by category if provided (with hierarchical support)
    if params[:category_id].present? || params[:category_slug].present?
      category = nil
      if params[:category_id].present?
        category = Category.find_by(id: params[:category_id])
      elsif params[:category_slug].present?
        category = Category.find_by(slug: params[:category_slug])
      end
      
      if category
        # Get all descendant category IDs (including the selected category)
        category_ids = category.self_and_descendants.pluck(:id)
        products = products.where(category_id: category_ids)
      end
    end
    
    # Filter by store if provided
    if params[:store_id].present?
      products = products.where(store_id: params[:store_id])
    end
    
    products = products.limit(100) # Increased limit for better user experience
    
    render json: {
      success: true,
      data: {
        products: products.map { |product| serialize_product(product) }
      }
    }
  end

  def show
    render json: {
      success: true,
      data: {
        product: serialize_product(@product, include_variants: true)
      }
    }
  end

  def create
    unless current_user.store
      render json: {
        success: false,
        error: 'You must have a store to create products'
      }, status: :unprocessable_entity
      return
    end

    product = current_user.store.products.build(product_params)
    
    if product.save
      # Create variants if provided
      if params[:variants].present?
        create_variants(product, params[:variants])
      end
      
      render json: {
        success: true,
        data: {
          product: serialize_product(product, include_variants: true)
        }
      }, status: :created
    else
      render json: {
        success: false,
        error: product.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def update
    if @product.update(product_params)
      # Update variants if provided
      if params[:variants].present?
        update_variants(@product, params[:variants])
      end
      
      render json: {
        success: true,
        data: {
          product: serialize_product(@product, include_variants: true)
        }
      }
    else
      render json: {
        success: false,
        error: @product.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @product.destroy
    render json: {
      success: true,
      message: 'Product deleted successfully'
    }
  end

  # Get products for current seller
  def my_products
    products = current_user.store.products.includes(:category, :product_variants)
    
    # Filter by status if provided
    if params[:status].present? && Product.statuses.key?(params[:status])
      products = products.where(status: params[:status])
    end
    
    products = products.order(created_at: :desc)
    
    render json: {
      success: true,
      data: {
        products: products.map { |product| serialize_product(product, include_variants: true) }
      }
    }
  end

  private

  def set_product
    # Try to find by ID first, then by slug
    @product = Product.find_by(id: params[:id]) || Product.find_by(slug: params[:id])
    
    unless @product
      render json: {
        success: false,
        error: 'Product not found'
      }, status: :not_found
    end
  end

  def product_params
    params.require(:product).permit(
      :name, :description, :short_description, :base_price, :compare_at_price,
      :sku, :track_inventory, :inventory, :low_stock_threshold, :weight, :dimensions,
      :meta_title, :meta_description, :status, :is_featured, :category_id,
      :option1_name, :option2_name, :option3_name,
      materials: [], images: [], videos: []
    )
  end

  def ensure_seller!
    unless current_user&.seller_admin?
      render json: {
        success: false,
        error: 'Seller access required'
      }, status: :forbidden
    end
  end

  def ensure_product_owner!
    unless @product.store.owner == current_user
      render json: {
        success: false,
        error: 'Not authorized to access this product'
      }, status: :forbidden
    end
  end

  def create_variants(product, variants_params)
    variants_params.each do |variant_params|
      product.product_variants.create!(
        option1_value: variant_params[:option1_value],
        option2_value: variant_params[:option2_value],
        option3_value: variant_params[:option3_value],
        price: variant_params[:price],
        inventory: variant_params[:inventory] || 0,
        sku: variant_params[:sku],
        weight: variant_params[:weight],
        dimensions: variant_params[:dimensions]
      )
    end
  end

  def update_variants(product, variants_params)
    # Simple approach: delete all and recreate
    # TODO: More sophisticated updating to preserve data
    product.product_variants.destroy_all
    create_variants(product, variants_params)
  end

  def serialize_product(product, include_variants: false)
    result = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      short_description: product.short_description,
      base_price: product.base_price,
      compare_at_price: product.compare_at_price,
      price_range: product.price_range,
      sku: product.sku,
      track_inventory: product.track_inventory,
      inventory: product.inventory,
      total_inventory: product.total_inventory,
      low_stock_threshold: product.low_stock_threshold,
      weight: product.weight,
      dimensions: product.dimensions,
      materials: product.materials,
      images: product.images,
      videos: product.videos,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      status: product.status,
      is_featured: product.is_featured,
      created_at: product.created_at,
      updated_at: product.updated_at,
      option1_name: product.option1_name,
      option2_name: product.option2_name,
      option3_name: product.option3_name,
      has_variants: product.has_variants?,
      variant_count: product.variant_count,
      store: {
        id: product.store.id,
        name: product.store.name,
        slug: product.store.slug
      },
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug
      }
    }

    if include_variants && product.product_variants.loaded?
      result[:variants] = product.product_variants.map do |variant|
        {
          id: variant.id,
          option1_value: variant.option1_value,
          option2_value: variant.option2_value,
          option3_value: variant.option3_value,
          price: variant.price,
          inventory: variant.inventory,
          sku: variant.sku,
          weight: variant.weight,
          dimensions: variant.dimensions,
          display_name: variant.display_name,
          available: variant.available?,
          low_stock: variant.low_stock?
        }
      end
    end

    result
  end
end