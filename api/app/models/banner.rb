class Banner < ApplicationRecord
  validates :title, presence: true, length: { maximum: 100 }
  validates :subtitle, length: { maximum: 150 }
  validates :description, length: { maximum: 500 }
  validates :cta_text, length: { maximum: 50 }
  validates :cta_url, format: { with: URI::DEFAULT_PARSER.make_regexp(['http', 'https']) }, allow_blank: true
  validates :background_color, format: { with: /\A#[0-9a-fA-F]{6}\z/ }, allow_blank: true
  validates :text_color, format: { with: /\A#[0-9a-fA-F]{6}\z/ }, allow_blank: true
  validates :position, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :created_by, presence: true

  # Callbacks
  before_create :set_cuid_id
  before_validation :set_default_colors, on: :create

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :current, -> { 
    where('(start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)', 
          Time.current, Time.current) 
  }
  scope :by_position, -> { order(:position, :created_at) }

  # Get currently active banners
  def self.live
    active.current.by_position
  end

  # Check if banner is currently live
  def live?
    is_active? && 
    (start_date.nil? || start_date <= Time.current) && 
    (end_date.nil? || end_date >= Time.current)
  end

  # Check if banner is scheduled for future
  def scheduled?
    is_active? && start_date.present? && start_date > Time.current
  end

  # Check if banner has expired
  def expired?
    end_date.present? && end_date < Time.current
  end

  private

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end

  def set_default_colors
    self.background_color = '#1a5f4a' if background_color.blank? # forest-600
    self.text_color = '#ffffff' if text_color.blank?
  end
end
