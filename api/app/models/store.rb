class Store < ApplicationRecord
  # Include Shrine attachments for logo and banner
  include ImageUploader::Attachment[:logo]
  include ImageUploader::Attachment[:banner]
  include PublicImageUrls
  
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
    
    case size.to_sym
    when :thumb, :medium, :large
      generate_public_url(logo, size: size)
    when :original
      generate_public_url(logo)
    else
      generate_public_url(logo, size: :medium) # Default to medium
    end
  end
  
  # Get banner URL for specific size
  def banner_url(size: :large)
    return nil unless banner.present?
    
    case size.to_sym
    when :thumb, :medium, :large, :hero, :hero_mobile
      generate_public_url(banner, size: size)
    when :original
      generate_public_url(banner)
    else
      generate_public_url(banner, size: :large) # Default to large
    end
  end

  private

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
