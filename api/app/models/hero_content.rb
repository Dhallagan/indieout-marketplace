class HeroContent < ApplicationRecord
  include ImageUploader::Attachment(:background_image)
  include ImageUploader::Attachment(:featured_collection_image)
  
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
    
    # Generate presigned URL with expiration for S3/Tigris
    url = case size.to_sym
    when :thumb
      background_image(:thumb)&.url(expires_in: 7.days.to_i)
    when :medium
      background_image(:medium)&.url(expires_in: 7.days.to_i)
    when :large
      background_image(:large)&.url(expires_in: 7.days.to_i)
    when :hero
      background_image(:hero)&.url(expires_in: 7.days.to_i)
    when :hero_mobile
      background_image(:hero_mobile)&.url(expires_in: 7.days.to_i)
    when :original
      background_image&.url(expires_in: 7.days.to_i)
    else
      background_image(:hero)&.url(expires_in: 7.days.to_i) # Default to hero
    end
    
    # Ensure URL is absolute
    ensure_absolute_url(url)
  end

  # Get featured collection image URL for specific size
  def featured_collection_image_url(size: :medium)
    return nil unless featured_collection_image.present?
    
    # Generate presigned URL with expiration for S3/Tigris
    url = case size.to_sym
    when :thumb
      featured_collection_image(:thumb)&.url(expires_in: 7.days.to_i)
    when :medium
      featured_collection_image(:medium)&.url(expires_in: 7.days.to_i)
    when :large
      featured_collection_image(:large)&.url(expires_in: 7.days.to_i)
    when :original
      featured_collection_image&.url(expires_in: 7.days.to_i)
    else
      featured_collection_image(:medium)&.url(expires_in: 7.days.to_i) # Default to medium
    end
    
    # Ensure URL is absolute
    ensure_absolute_url(url)
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
