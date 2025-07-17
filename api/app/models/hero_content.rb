class HeroContent < ApplicationRecord
  include ImageUploader::Attachment(:background_image)
  include ImageUploader::Attachment(:featured_collection_image)
  include PublicImageUrls
  
  validates :title, presence: true, length: { maximum: 200 }
  validates :subtitle, length: { maximum: 300 }
  validates :description, length: { maximum: 1000 }
  validates :cta_primary_text, length: { maximum: 50 }
  validates :cta_secondary_text, length: { maximum: 50 }
  validates :cta_primary_url, format: { 
    with: %r{\A(/|https?://)[^\s]*\z}, 
    message: 'must be a valid URL or path' 
  }, allow_blank: true
  validates :cta_secondary_url, format: { 
    with: %r{\A(/|https?://)[^\s]*\z}, 
    message: 'must be a valid URL or path' 
  }, allow_blank: true

  # Callbacks
  before_create :set_cuid_id
  before_create :deactivate_others, if: :is_active?

  scope :active, -> { where(is_active: true) }

  # Get the current active hero content
  def self.current
    active.first
  end

  # Get background image URL for specific size
  def background_image_url(size: :hero)
    return nil unless background_image.present?
    
    case size.to_sym
    when :thumb, :medium, :large, :hero, :hero_mobile
      generate_public_url(background_image, size: size)
    when :original
      generate_public_url(background_image)
    else
      generate_public_url(background_image, size: :hero) # Default to hero
    end
  end

  # Get featured collection image URL for specific size
  def featured_collection_image_url(size: :medium)
    return nil unless featured_collection_image.present?
    
    case size.to_sym
    when :thumb, :medium, :large
      generate_public_url(featured_collection_image, size: size)
    when :original
      generate_public_url(featured_collection_image)
    else
      generate_public_url(featured_collection_image, size: :medium) # Default to medium
    end
  end

  private

  def ensure_absolute_url(url)
    return nil if url.blank?
    
    # URL is already absolute (including presigned S3/Tigris URLs)
    return url if url.start_with?('http://', 'https://')
    
    # For relative URLs (local storage), prepend the host
    host = ENV.fetch('RAILS_HOST', 'http://localhost:5000')
    "#{host}#{url}"
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end

  # Ensure only one hero content is active at a time
  def deactivate_others
    HeroContent.where(is_active: true).update_all(is_active: false)
  end
end
