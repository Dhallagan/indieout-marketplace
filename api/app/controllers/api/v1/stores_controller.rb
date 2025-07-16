class Api::V1::StoresController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_seller!, except: [:show]
  before_action :set_store, only: [:show, :update, :destroy]
  before_action :ensure_store_owner!, only: [:update, :destroy]

  def index
    stores = current_user.stores
    render json: {
      success: true,
      data: {
        stores: stores.map { |store| StoreSerializer.new(store).serializable_hash[:data][:attributes] }
      }
    }
  end

  def show
    render json: {
      success: true,
      data: {
        store: StoreSerializer.new(@store).serializable_hash[:data][:attributes]
      }
    }
  end

  def create
    # Check if user already has a store
    if current_user.store.present?
      render json: {
        success: false,
        error: 'You already have a store'
      }, status: :unprocessable_entity
      return
    end

    store = current_user.build_store(store_params)
    
    if store.save
      render json: {
        success: true,
        data: {
          store: StoreSerializer.new(store).serializable_hash[:data][:attributes]
        }
      }, status: :created
    else
      render json: {
        success: false,
        error: store.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def update
    if @store.update(store_params)
      render json: {
        success: true,
        data: {
          store: StoreSerializer.new(@store).serializable_hash[:data][:attributes]
        }
      }
    else
      render json: {
        success: false,
        error: @store.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @store.destroy
    render json: {
      success: true,
      message: 'Store deleted successfully'
    }
  end

  # Submit store for admin review to go live
  def submit_for_review
    store = current_user.store
    
    unless store
      render json: {
        success: false,
        error: 'No store found'
      }, status: :not_found
      return
    end

    if store.products.none?
      render json: {
        success: false,
        error: 'Cannot submit store for review without any products'
      }, status: :unprocessable_entity
      return
    end

    # Mark store as under review
    store.update!(
      is_active: false,
      review_requested_at: Time.current
    )

    render json: {
      success: true,
      message: 'Store submitted for review successfully'
    }
  end

  private

  def set_store
    @store = Store.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Store not found'
    }, status: :not_found
  end

  def store_params
    params.require(:store).permit(
      :name, :description, :website,
      :commission_rate, :logo, :banner,
      :email, :phone
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

  def ensure_store_owner!
    unless @store.owner == current_user
      render json: {
        success: false,
        error: 'Not authorized to access this store'
      }, status: :forbidden
    end
  end
end