class Product < ApplicationRecord
  belongs_to :store
  belongs_to :category
  has_many :product_variants, dependent: :destroy
  has_many :product_images, dependent: :destroy

  enum status: {
    draft: 0,
    pending_approval: 1,
    active: 2,
    inactive: 3,
    rejected: 4
  }

  validates :name, presence: true, length: { minimum: 2, maximum: 200 }
  validates :slug, presence: true, uniqueness: { case_sensitive: false }
  validates :description, presence: true, length: { minimum: 20, maximum: 5000 }
  validates :base_price, presence: true, numericality: { greater_than: 0 }

  # Callbacks
  before_validation :generate_slug, if: -> { slug.blank? && name.present? }
  before_create :set_cuid_id

  # Scopes
  scope :active, -> { where(status: :active) }
  scope :featured, -> { where(is_featured: true) }
  scope :by_store, ->(store_id) { where(store_id: store_id) }

  # Variant options (Shopify-style)
  def has_variants?
    option1_name.present?
  end

  def option_names
    [option1_name, option2_name, option3_name].compact
  end

  def variant_count
    product_variants.count
  end

  # Get price range for display
  def price_range
    if has_variants? && product_variants.any?
      prices = product_variants.pluck(:price)
      min_price = prices.min
      max_price = prices.max
      
      if min_price == max_price
        min_price
      else
        "#{min_price} - #{max_price}"
      end
    else
      base_price
    end
  end

  # Get available inventory
  def total_inventory
    if has_variants?
      product_variants.sum(:inventory)
    else
      inventory
    end
  end

  private

  def generate_slug
    base_slug = name.downcase.gsub(/[^a-z0-9\-_]/, '-').gsub(/-+/, '-').gsub(/^-+|-+$/, '')
    candidate_slug = base_slug
    counter = 1

    while Product.exists?(slug: candidate_slug)
      candidate_slug = "#{base_slug}-#{counter}"
      counter += 1
    end

    self.slug = candidate_slug
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end
