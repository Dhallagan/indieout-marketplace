class Api::V1::HeroContentController < ApplicationController
  before_action :authenticate_user!, except: [:current]
  before_action :ensure_admin!, except: [:current]
  before_action :set_hero_content, only: [:show, :update]

  def show
    hero = HeroContent.current || create_default_hero
    
    render json: {
      success: true,
      data: {
        hero: serialize_hero(hero)
      }
    }
  end

  def update
    hero = HeroContent.current || create_default_hero
    
    begin
      # Handle file uploads
      if params[:hero][:background_image_file].present?
        hero.background_image = params[:hero][:background_image_file]
        params[:hero].delete(:background_image_file)
      end
      
      if params[:hero][:featured_collection_image_file].present?
        hero.featured_collection_image = params[:hero][:featured_collection_image_file]
        params[:hero].delete(:featured_collection_image_file)
      end
      
      # Remove existing image URLs from params - Shrine will preserve them automatically
      # Only update images when new files are uploaded
      params[:hero].delete(:background_image) if params[:hero].key?(:background_image)
      params[:hero].delete(:featured_collection_image) if params[:hero].key?(:featured_collection_image)
      
      if hero.update(hero_params)
        render json: {
          success: true,
          data: {
            hero: serialize_hero(hero)
          }
        }
      else
        render json: {
          success: false,
          error: hero.errors.full_messages.first
        }, status: :unprocessable_entity
      end
    rescue => e
      Rails.logger.error "Error updating hero content: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      render json: {
        success: false,
        error: "Failed to update hero content: #{e.message}"
      }, status: :internal_server_error
    end
  end

  # Public endpoint to get current hero content
  def current
    hero = HeroContent.current || default_hero_data
    
    begin
      if hero.is_a?(HeroContent)
        serialized = serialize_hero(hero)
        render json: {
          success: true,
          data: {
            hero: serialized
          }
        }
      else
        render json: {
          success: true,
          data: {
            hero: hero
          }
        }
      end
    rescue => e
      Rails.logger.error "Error in hero content current: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      # Return default data on error
      render json: {
        success: true,
        data: {
          hero: default_hero_data
        }
      }
    end
  end

  private

  def set_hero_content
    @hero_content = HeroContent.current
  end

  def hero_params
    params.require(:hero).permit(
      :title, :subtitle, :description, :cta_primary_text, :cta_primary_url,
      :cta_secondary_text, :cta_secondary_url, :is_active,
      :featured_collection_title, :featured_collection_subtitle
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

  def serialize_hero(hero)
    {
      id: hero.id,
      title: hero.title,
      subtitle: hero.subtitle,
      description: hero.description,
      cta_primary_text: hero.cta_primary_text,
      cta_primary_url: hero.cta_primary_url,
      cta_secondary_text: hero.cta_secondary_text,
      cta_secondary_url: hero.cta_secondary_url,
      background_image: get_image_url(hero, :background_image),
      background_image_hero: get_image_url(hero, :background_image, :hero),
      background_image_mobile: get_image_url(hero, :background_image, :hero_mobile),
      is_active: hero.is_active,
      featured_collection_title: hero.featured_collection_title,
      featured_collection_subtitle: hero.featured_collection_subtitle,
      featured_collection_image: get_image_url(hero, :featured_collection_image),
      featured_collection_image_thumb: get_image_url(hero, :featured_collection_image, :thumb),
      created_at: hero.created_at,
      updated_at: hero.updated_at
    }
  end

  def get_image_url(hero, field, derivative = :original)
    return nil unless hero.respond_to?(field)
    
    # Check if there's Shrine data for this field
    if hero.respond_to?("#{field}_data") && hero.send("#{field}_data").present?
      # Return Shrine URL for uploaded file
      attacher = hero.send("#{field}_attacher")
      return nil unless attacher && attacher.file
      
      if derivative == :original
        attacher.url
      else
        # Check if derivative exists before trying to get its URL
        if attacher.derivatives && attacher.derivatives[derivative]
          attacher.url(derivative)
        else
          # Fall back to original if derivative doesn't exist
          attacher.url
        end
      end
    else
      # Return the legacy URL string if no file uploaded
      hero.send(field) if hero.respond_to?(field)
    end
  rescue => e
    Rails.logger.error "Error getting image URL for #{field}: #{e.message}"
    nil
  end

  def create_default_hero
    HeroContent.create!(
      title: "Handcrafted gear for trail-worthy adventures",
      subtitle: "",
      description: "Connect with independent sellers creating durable, sustainable outdoor equipment for your next journey.",
      cta_primary_text: "Explore the marketplace",
      cta_primary_url: "https://indieout.com/shop",
      cta_secondary_text: "Start selling your gear",
      cta_secondary_url: "https://indieout.com/apply-to-sell",
      featured_collection_title: "FEATURED COLLECTION",
      featured_collection_subtitle: "Desert Trail Essentials",
      featured_collection_image: "",
      is_active: true
    )
  end

  def default_hero_data
    {
      title: "Handcrafted gear for trail-worthy adventures",
      subtitle: "",
      description: "Connect with independent sellers creating durable, sustainable outdoor equipment for your next journey.",
      cta_primary_text: "Explore the marketplace",
      cta_primary_url: "/shop",
      cta_secondary_text: "Start selling your gear",
      cta_secondary_url: "/apply-to-sell",
      featured_collection_title: "FEATURED COLLECTION",
      featured_collection_subtitle: "Desert Trail Essentials",
      featured_collection_image: ""
    }
  end
end