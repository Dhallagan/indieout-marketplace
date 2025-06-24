class Api::V1::Public::StoresController < ApplicationController
  before_action :set_store, only: [:show]

  # Public endpoint to list all verified, active stores
  def index
    stores = Store.where(is_verified: true, is_active: true)
                  .includes(:owner)
                  .order(:name)
    
    render json: {
      success: true,
      data: {
        stores: stores.map { |store| serialize_public_store(store) }
      }
    }
  end

  # Public endpoint to show a specific store by ID or slug
  def show
    render json: {
      success: true,
      data: {
        store: serialize_public_store(@store)
      }
    }
  end

  private

  def set_store
    # Try to find by ID first, then by slug
    @store = Store.find_by(id: params[:id]) || Store.find_by(slug: params[:id])
    
    # Only show verified and active stores to public
    @store = nil unless @store&.is_verified? && @store&.is_active?
    
    unless @store
      render json: {
        success: false,
        error: 'Store not found'
      }, status: :not_found
    end
  end

  def serialize_public_store(store)
    {
      id: store.id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      logo: store.logo,
      banner: store.banner,
      website: store.website,
      is_verified: store.is_verified,
      created_at: store.created_at,
      updated_at: store.updated_at,
      product_count: store.products.active.count,
      owner: {
        id: store.owner.id,
        first_name: store.owner.first_name,
        last_name: store.owner.last_name
      }
    }
  end
end
