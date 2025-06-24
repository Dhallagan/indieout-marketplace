class ProductVariant < ApplicationRecord
  belongs_to :product

  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :inventory, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, uniqueness: { scope: :product_id }, allow_blank: true

  # Ensure variant combination is unique per product
  validates :option1_value, uniqueness: { 
    scope: [:product_id, :option2_value, :option3_value],
    message: "combination already exists"
  }

  before_create :set_cuid_id
  before_validation :generate_sku, if: -> { sku.blank? }

  scope :available, -> { where('inventory > 0') }
  scope :low_stock, -> { joins(:product).where('product_variants.inventory <= products.low_stock_threshold') }

  def display_name
    options = [option1_value, option2_value, option3_value].compact
    if options.any?
      "#{product.name} - #{options.join(' / ')}"
    else
      product.name
    end
  end

  def option_values
    [option1_value, option2_value, option3_value].compact
  end

  def available?
    inventory > 0
  end

  def low_stock?
    inventory <= product.low_stock_threshold
  end

  private

  def generate_sku
    # Generate SKU from product and variant info
    base = product.name.upcase.gsub(/[^A-Z0-9]/, '').first(4)
    options = option_values.map { |opt| opt.to_s.upcase.gsub(/[^A-Z0-9]/, '').first(3) }.join('-')
    
    candidate_sku = options.present? ? "#{base}-#{options}" : base
    counter = 1
    
    while ProductVariant.exists?(sku: candidate_sku)
      candidate_sku = options.present? ? "#{base}-#{options}-#{counter}" : "#{base}-#{counter}"
      counter += 1
    end
    
    self.sku = candidate_sku
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end