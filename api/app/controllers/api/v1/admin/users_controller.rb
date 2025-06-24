class Api::V1::Admin::UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_user, only: [:toggle_status, :role]

  def index
    users = User.includes(:store).order(:created_at)
    
    users_data = users.map do |user|
      serialize_user(user)
    end

    render json: {
      success: true,
      data: {
        users: users_data
      }
    }
  end

  def toggle_status
    @user.update!(is_active: !@user.is_active?)

    render json: {
      success: true,
      data: {
        user: serialize_user(@user)
      }
    }
  end

  def role
    @user.update!(role: params[:role])

    render json: {
      success: true,
      data: {
        user: serialize_user(@user)
      }
    }
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end

  def serialize_user(user)
    {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      email_verified_at: user.email_verified_at,
      is_active: user.is_active?,
      created_at: user.created_at,
      updated_at: user.updated_at,
      store: user.store ? {
        id: user.store.id,
        name: user.store.name,
        is_verified: user.store.is_verified?
      } : nil
    }
  end
end