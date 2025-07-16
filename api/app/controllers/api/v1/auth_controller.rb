class Api::V1::AuthController < ApplicationController
  before_action :authenticate_user!, only: [:me, :become_seller, :impersonate]

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
    user_data = UserSerializer.new(current_user).serializable_hash[:data][:attributes]
    
    # Add impersonation info if present
    if @decoded_token&.dig('impersonator_id')
      user_data[:is_impersonating] = true
      user_data[:impersonator_id] = @decoded_token['impersonator_id']
    end
    
    render json: {
      success: true,
      data: {
        user: user_data
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

  # System admin only - impersonate another user
  def impersonate
    unless current_user&.system_admin?
      render json: { success: false, error: 'Admin access required' }, status: :forbidden
      return
    end

    target_user = User.find_by(id: params[:user_id])
    
    unless target_user
      render json: { success: false, error: 'User not found' }, status: :not_found
      return
    end

    # Generate token for the target user with impersonation info
    token = JwtService.encode(
      user_id: target_user.id,
      impersonator_id: current_user.id
    )
    
    render json: {
      success: true,
      data: {
        user: UserSerializer.new(target_user).serializable_hash[:data][:attributes],
        token: token,
        message: "Now impersonating #{target_user.email}",
        is_impersonating: true,
        impersonator_id: current_user.id
      }
    }
  end

  # Exit impersonation and return to admin account
  def exit_impersonation
    # Check if current session is an impersonation
    impersonator_id = @decoded_token&.dig(:impersonator_id)
    
    unless impersonator_id
      render json: { success: false, error: 'Not currently impersonating' }, status: :bad_request
      return
    end

    # Load the original admin user
    admin_user = User.find_by(id: impersonator_id)
    
    unless admin_user
      render json: { success: false, error: 'Original admin user not found' }, status: :not_found
      return
    end

    # Generate new token for the admin user
    token = JwtService.encode(user_id: admin_user.id)
    
    render json: {
      success: true,
      data: {
        user: UserSerializer.new(admin_user).serializable_hash[:data][:attributes],
        token: token,
        message: "Returned to admin account"
      }
    }
  end

  private

  def user_params
    # Always default to consumer role - users can become sellers later
    params.permit(:email, :password, :first_name, :last_name).merge(role: :consumer)
  end
end
