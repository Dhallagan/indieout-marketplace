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
  end

  # Public endpoint to get current hero content
  def current
    hero = HeroContent.current || default_hero_data
    
    render json: {
      success: true,
      data: {
        hero: hero.is_a?(HeroContent) ? serialize_hero(hero) : hero
      }
    }
  end

  private

  def set_hero_content
    @hero_content = HeroContent.current
  end

  def hero_params
    params.require(:hero).permit(
      :title, :subtitle, :description, :cta_primary_text, :cta_primary_url,
      :cta_secondary_text, :cta_secondary_url, :background_image, :is_active,
      :featured_collection_title, :featured_collection_subtitle, :featured_collection_image
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
      background_image: hero.background_image,
      is_active: hero.is_active,
      featured_collection_title: hero.featured_collection_title,
      featured_collection_subtitle: hero.featured_collection_subtitle,
      featured_collection_image: hero.featured_collection_image,
      created_at: hero.created_at,
      updated_at: hero.updated_at
    }
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