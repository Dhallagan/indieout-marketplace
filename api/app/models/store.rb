class Store < ApplicationRecord
  # Include Shrine attachments for logo and banner
  include ImageUploader::Attachment[:logo]
  include ImageUploader::Attachment[:banner]
  
  # Associations
  belongs_to :owner, class_name: 'User'
  has_many :products, dependent: :destroy
  has_many :orders, dependent: :restrict_with_error

  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A[a-z0-9\-_]+\z/, message: "only allows lowercase letters, numbers, hyphens, and underscores" }
  validates :commission_rate, presence: true, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 1 }

  # Callbacks
  before_validation :generate_slug, if: -> { slug.blank? && name.present? }
  before_create :set_cuid_id

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :verified, -> { where(is_verified: true) }

  # Instance methods
  def active?
    is_active
  end

  def verified?
    is_verified
  end

  def display_rating
    rating&.round(1) || 0.0
  end

  # Get logo URL for specific size
  def logo_url(size: :medium)
    return nil unless logo.present?
    
    # Generate presigned URL with expiration
    url = case size.to_sym
    when :thumb
      # Try derivative first, fallback to original if not ready
      if logo_derivatives && logo_derivatives[:thumb]
        logo(:thumb)&.url(expires_in: 7.days.to_i)
      else
        logo&.url(expires_in: 7.days.to_i)
      end
    when :medium
      if logo_derivatives && logo_derivatives[:medium]
        logo(:medium)&.url(expires_in: 7.days.to_i)
      else
        logo&.url(expires_in: 7.days.to_i)
      end
    when :large
      if logo_derivatives && logo_derivatives[:large]
        logo(:large)&.url(expires_in: 7.days.to_i)
      else
        logo&.url(expires_in: 7.days.to_i)
      end
    when :original
      logo&.url(expires_in: 7.days.to_i)
    else
      # Default to medium, but fallback to original if not ready
      if logo_derivatives && logo_derivatives[:medium]
        logo(:medium)&.url(expires_in: 7.days.to_i)
      else
        logo&.url(expires_in: 7.days.to_i)
      end
    end
    
    # For S3/Tigris, URL is already absolute; for local storage, ensure it's absolute
    ensure_absolute_url(url)
  end
  
  # Get banner URL for specific size
  def banner_url(size: :large)
    return nil unless banner.present?
    
    # Generate presigned URL with expiration
    url = case size.to_sym
    when :thumb
      if banner_derivatives && banner_derivatives[:thumb]
        banner(:thumb)&.url(expires_in: 7.days.to_i)
      else
        banner&.url(expires_in: 7.days.to_i)
      end
    when :medium
      if banner_derivatives && banner_derivatives[:medium]
        banner(:medium)&.url(expires_in: 7.days.to_i)
      else
        banner&.url(expires_in: 7.days.to_i)
      end
    when :large
      if banner_derivatives && banner_derivatives[:large]
        banner(:large)&.url(expires_in: 7.days.to_i)
      else
        banner&.url(expires_in: 7.days.to_i)
      end
    when :hero
      if banner_derivatives && banner_derivatives[:hero]
        banner(:hero)&.url(expires_in: 7.days.to_i)
      else
        banner&.url(expires_in: 7.days.to_i)
      end
    when :hero_mobile
      if banner_derivatives && banner_derivatives[:hero_mobile]
        banner(:hero_mobile)&.url(expires_in: 7.days.to_i)
      else
        banner&.url(expires_in: 7.days.to_i)
      end
    when :original
      banner&.url(expires_in: 7.days.to_i)
    else
      # Default to large for banners, but fallback to original if not ready
      if banner_derivatives && banner_derivatives[:large]
        banner(:large)&.url(expires_in: 7.days.to_i)
      else
        banner&.url(expires_in: 7.days.to_i)
      end
    end
    
    # For S3/Tigris, URL is already absolute; for local storage, ensure it's absolute
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

  def generate_slug
    base_slug = name.downcase.gsub(/[^a-z0-9\-_]/, '-').gsub(/-+/, '-').strip('-')
    candidate_slug = base_slug
    counter = 1

    while Store.exists?(slug: candidate_slug)
      candidate_slug = "#{base_slug}-#{counter}"
      counter += 1
    end

    self.slug = candidate_slug
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end
