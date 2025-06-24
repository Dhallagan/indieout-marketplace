class OrderItem < ApplicationRecord
  belongs_to :order
  belongs_to :product

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :unit_price, :total_price, presence: true, numericality: { greater_than: 0 }
  validates :product_snapshot, presence: true

  before_validation :calculate_total_price
  before_validation :capture_product_snapshot

  def product_name
    product_snapshot['name'] || product.name
  end

  def product_sku
    product_snapshot['sku'] || product.sku
  end

  def product_image
    product_snapshot['images']&.first || product.images&.first
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
      images: product.images,
      category: product.category&.name,
      store: product.store&.name
    }
  end
end
