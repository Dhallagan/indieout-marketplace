class Api::V1::Public::BannersController < ApplicationController
  # Public endpoint to get live banners
  def index
    banners = Banner.live.limit(5) # Limit to prevent too many banners

    render json: {
      success: true,
      data: {
        banners: banners.map { |banner| serialize_banner(banner) }
      }
    }
  end

  private

  def serialize_banner(banner)
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
      position: banner.position
    }
  end
end
