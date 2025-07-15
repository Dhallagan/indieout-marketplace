class ApplicationController < ActionController::API
  before_action :set_current_user
  
  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActionController::RoutingError, with: :not_found

  protected

  def authenticate_user!
    render json: { success: false, error: 'Not authenticated' }, status: :unauthorized unless current_user
  end

  def authorize_role!(role)
    render json: { success: false, error: 'Not authorized' }, status: :forbidden unless current_user&.role == role.to_s
  end

  def current_user
    @current_user
  end

  private

  def set_current_user
    return unless request.headers['Authorization'].present?

    token = request.headers['Authorization'].split(' ').last
    return unless token

    begin
      decoded_token = JwtService.decode(token)
      user = User.find_by(id: decoded_token['user_id'])
      
      if user&.email_verified?
        @current_user = user
      end
    rescue StandardError => e
      Rails.logger.debug "JWT decode error: #{e.message}"
    end
  end
  
  def not_found
    render json: { 
      success: false, 
      error: 'Resource not found',
      message: 'The requested resource could not be found'
    }, status: :not_found
  end
  
  def fallback_index_html
    render file: Rails.root.join('public', 'index.html'), layout: false
  end
end
