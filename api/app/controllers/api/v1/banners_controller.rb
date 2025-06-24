class Api::V1::BannersController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_admin!
  before_action :set_banner, only: [:show, :update, :destroy]

  def index
    banners = Banner.order(:position, :created_at)
    
    render json: {
      success: true,
      data: {
        banners: banners.map { |banner| serialize_full_banner(banner) }
      }
    }
  end

  def show
    render json: {
      success: true,
      data: {
        banner: serialize_full_banner(@banner)
      }
    }
  end

  def create
    banner = Banner.new(banner_params)
    banner.created_by = current_user.id
    
    if banner.save
      render json: {
        success: true,
        data: {
          banner: serialize_full_banner(banner)
        }
      }, status: :created
    else
      render json: {
        success: false,
        error: banner.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def update
    if @banner.update(banner_params)
      render json: {
        success: true,
        data: {
          banner: serialize_full_banner(@banner)
        }
      }
    else
      render json: {
        success: false,
        error: @banner.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @banner.destroy
    render json: {
      success: true,
      message: 'Banner deleted successfully'
    }
  end

  private

  def set_banner
    @banner = Banner.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Banner not found'
    }, status: :not_found
  end

  def banner_params
    params.require(:banner).permit(
      :title, :subtitle, :description, :cta_text, :cta_url,
      :background_image, :background_color, :text_color,
      :position, :is_active, :start_date, :end_date
    )
  end

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end

  def serialize_full_banner(banner)
    {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      cta_text: banner.cta_text,
      cta_url: banner.cta_url,
      background_image: banner.background_image,
      background_color: banner.background_color,
      text_color: banner.text_color,
      position: banner.position,
      is_active: banner.is_active,
      start_date: banner.start_date,
      end_date: banner.end_date,
      created_by: banner.created_by,
      created_at: banner.created_at,
      updated_at: banner.updated_at,
      status: banner.live? ? 'live' : (banner.scheduled? ? 'scheduled' : (banner.expired? ? 'expired' : 'inactive'))
    }
  end
end
