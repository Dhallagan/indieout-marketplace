class Api::V1::Admin::DashboardController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!

  def stats
    stats = {
      total_users: User.count,
      total_sellers: Store.count,
      pending_sellers: Store.where(verification_status: 'pending').count,
      verified_sellers: Store.where(is_verified: true).count,
      total_products: Product.count,
      total_orders: 0, # Will implement when Order model exists
      revenue_total: 0, # Will implement when Order model exists
      revenue_this_month: 0 # Will implement when Order model exists
    }

    render json: {
      success: true,
      data: {
        stats: stats
      }
    }
  end

  private

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end
end