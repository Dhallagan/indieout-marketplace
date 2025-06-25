class ProductImageSerializer
  include JSONAPI::Serializer

  attributes :id, :position, :alt_text, :created_at, :updated_at

  belongs_to :product

  # Image URLs for different sizes
  attribute :image_url do |product_image|
    product_image.image_url(size: :original)
  end

  attribute :thumb_url do |product_image|
    product_image.image_url(size: :thumb)
  end

  attribute :medium_url do |product_image|
    product_image.image_url(size: :medium)
  end

  attribute :large_url do |product_image|
    product_image.image_url(size: :large)
  end

  # Image metadata
  attribute :metadata do |product_image|
    product_image.image&.metadata
  end

  attribute :dimensions do |product_image|
    product_image.dimensions
  end

  # Check if this is the primary image
  attribute :primary do |product_image|
    product_image.primary?
  end
end