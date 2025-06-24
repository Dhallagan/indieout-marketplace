class Api::V1::AuthController < ApplicationController
  before_action :authenticate_user!, only: [:me, :become_seller]

  def register
    user = User.new(user_params)
    
    if user.save
      token = JwtService.encode(user_id: user.id)
      render json: {
        success: true,
        data: {
          user: UserSerializer.new(user).serializable_hash[:data][:attributes],
          token: token,
          message: 'User registered successfully. Please verify your email.'
        }
      }, status: :created
    else
      render json: {
        success: false,
        error: user.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email]&.downcase)
    
    if user&.authenticate(params[:password])
      token = JwtService.encode(user_id: user.id)
      render json: {
        success: true,
        data: {
          user: UserSerializer.new(user).serializable_hash[:data][:attributes],
          token: token
        }
      }
    else
      render json: {
        success: false,
        error: 'Invalid credentials'
      }, status: :unauthorized
    end
  end

  def me
    render json: {
      success: true,
      data: {
        user: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
      }
    }
  end

  def verify_email
    token = params[:token]
    user = User.find_by(email_verification_token: token)

    if user
      user.verify_email!
      render json: {
        success: true,
        message: 'Email verified successfully'
      }
    else
      render json: {
        success: false,
        error: 'Invalid or expired token'
      }, status: :bad_request
    end
  end

  def forgot_password
    user = User.find_by(email: params[:email]&.downcase)
    
    if user
      user.generate_password_reset_token
      # TODO: Send email with reset link
      Rails.logger.info "Password reset token for #{user.email}: #{user.password_reset_token}"
    end

    # Always return success to avoid email enumeration
    render json: {
      success: true,
      message: 'If email exists, password reset link has been sent'
    }
  end

  def reset_password
    user = User.find_by(
      password_reset_token: params[:token],
      password_reset_expires: Time.current..
    )

    if user && params[:password].present? && params[:password].length >= 8
      user.password = params[:password]
      user.clear_password_reset_token
      render json: {
        success: true,
        message: 'Password reset successfully'
      }
    else
      render json: {
        success: false,
        error: user ? 'Password must be at least 8 characters long' : 'Invalid or expired token'
      }, status: :bad_request
    end
  end

  def become_seller
    if current_user.consumer?
      current_user.update!(role: :seller_admin)
      render json: {
        success: true,
        data: {
          user: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
        },
        message: 'Account upgraded to seller successfully'
      }
    else
      render json: {
        success: false,
        error: 'User is already a seller or admin'
      }, status: :unprocessable_entity
    end
  end

  private

  def user_params
    # Always default to consumer role - users can become sellers later
    params.permit(:email, :password, :first_name, :last_name).merge(role: :consumer)
  end
end
