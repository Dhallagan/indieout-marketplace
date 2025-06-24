class Api::V1::Admin::ProductsController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_product, only: [:toggle_featured, :status]

  def index
    products = Product.includes(:store, :category).order(:created_at)
    
    products_data = products.map do |product|
      serialize_product(product)
    end

    render json: {
      success: true,
      data: {
        products: products_data
      }
    }
  end

  def toggle_featured
    @product.update!(is_featured: !@product.is_featured?)

    render json: {
      success: true,
      data: {
        product: serialize_product(@product)
      }
    }
  end

  def status
    @product.update!(status: params[:status])

    render json: {
      success: true,
      data: {
        product: serialize_product(@product)
      }
    }
  end

  private

  def set_product
    @product = Product.find(params[:id])
  end

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end

  def serialize_product(product)
    {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      inventory: product.inventory,
      status: product.status,
      is_featured: product.is_featured?,
      created_at: product.created_at,
      store: {
        id: product.store.id,
        name: product.store.name,
        is_verified: product.store.is_verified?
      },
      category: product.category ? {
        id: product.category.id,
        name: product.category.name
      } : nil
    }
  end
end