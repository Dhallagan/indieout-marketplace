class HeroContent < ApplicationRecord
  include ImageUploader::Attachment(:background_image)
  include ImageUploader::Attachment(:featured_collection_image)
  
  validates :title, presence: true, length: { maximum: 200 }
  validates :subtitle, length: { maximum: 300 }
  validates :description, length: { maximum: 1000 }
  validates :cta_primary_text, length: { maximum: 50 }
  validates :cta_secondary_text, length: { maximum: 50 }
  validates :cta_primary_url, format: { with: URI::DEFAULT_PARSER.make_regexp(['http', 'https']) }, allow_blank: true
  validates :cta_secondary_url, format: { with: URI::DEFAULT_PARSER.make_regexp(['http', 'https']) }, allow_blank: true

  # Callbacks
  before_create :set_cuid_id
  before_create :deactivate_others, if: :is_active?

  scope :active, -> { where(is_active: true) }

  # Get the current active hero content
  def self.current
    active.first
  end

  private

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end

  # Ensure only one hero content is active at a time
  def deactivate_others
    HeroContent.where(is_active: true).update_all(is_active: false)
  end
end
