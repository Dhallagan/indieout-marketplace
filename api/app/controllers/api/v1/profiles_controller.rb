class Api::V1::ProfilesController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: {
      success: true,
      data: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
    }
  end

  def update
    if current_user.update(profile_params)
      render json: {
        success: true,
        data: UserSerializer.new(current_user).serializable_hash[:data][:attributes],
        message: 'Profile updated successfully'
      }
    else
      render json: {
        success: false,
        error: current_user.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:profile).permit(:first_name, :last_name, :email)
  end
end