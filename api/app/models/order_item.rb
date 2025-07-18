class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, :total_price, presence: true, numericality: { greater_than: 0 }
  validates :product_snapshot, presence: true

  before_validation :calculate_total_price
  before_validation :capture_product_snapshot
  before_create :set_cuid_id

  def product_name
    product_snapshot['name'] || product.name
  end

  def product_sku
    product_snapshot['sku'] || product.sku
  end

  def product_image
    if product_snapshot['images']&.first
      product_snapshot['images'].first
    elsif product&.product_images&.any?
      product.product_images.ordered.first&.image_url(size: :medium)
    end
  end

  private

  def calculate_total_price
    return unless quantity && unit_price
    
    self.total_price = quantity * unit_price
  end

  def capture_product_snapshot
    return if product_snapshot.present? || product.blank?
    
    self.product_snapshot = {
      name: product.name,
      sku: product.sku,
      description: product.description,
      short_description: product.short_description,
      base_price: product.base_price,
      images: product.product_images.ordered.map { |img| img.image_url(size: :medium) },
      category: product.category&.name,
      store: product.store&.name
    }
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end
