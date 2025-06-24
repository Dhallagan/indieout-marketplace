class Api::V1::Admin::SellersController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_store, only: [:approve, :reject, :toggle_status]

  def index
    stores = Store.includes(:owner).order(:created_at)
    
    sellers_data = stores.map do |store|
      serialize_seller(store)
    end

    render json: {
      success: true,
      data: {
        sellers: sellers_data
      }
    }
  end

  def approve
    @store.update!(
      is_verified: true,
      verification_status: 'verified'
    )

    # TODO: Send approval email to seller

    render json: {
      success: true,
      data: {
        seller: serialize_seller(@store)
      }
    }
  end

  def reject
    @store.update!(
      is_verified: false,
      verification_status: 'rejected'
    )

    # TODO: Send rejection email to seller with reason

    render json: {
      success: true,
      data: {
        seller: serialize_seller(@store)
      }
    }
  end

  def toggle_status
    @store.update!(is_active: !@store.is_active?)

    render json: {
      success: true,
      data: {
        seller: serialize_seller(@store)
      }
    }
  end

  private

  def set_store
    @store = Store.find(params[:id])
  end

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end

  def serialize_seller(store)
    {
      id: store.id,
      user_id: store.owner_id,
      name: store.name,
      slug: store.slug,
      description: store.description,
      email: store.email,
      phone: store.phone,
      website: store.website,
      is_verified: store.is_verified?,
      is_active: store.is_active?,
      verification_status: store.verification_status || (store.is_verified? ? 'verified' : 'pending'),
      total_products: store.products.count,
      total_sales: 0, # Will implement when Order model exists
      created_at: store.created_at,
      updated_at: store.updated_at,
      user: {
        id: store.owner.id,
        first_name: store.owner.first_name,
        last_name: store.owner.last_name,
        email: store.owner.email
      }
    }
  end
end