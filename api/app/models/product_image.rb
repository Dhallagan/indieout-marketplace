class ProductImage < ApplicationRecord
  include ImageUploader::Attachment[:image]
  include PublicImageUrls
  
  belongs_to :product
  
  validates :position, presence: true, uniqueness: { scope: :product_id }
  validates :alt_text, length: { maximum: 255 }
  
  scope :ordered, -> { order(:position) }
  scope :primary, -> { where(position: 1) }
  
  before_validation :set_position, if: :new_record?
  before_create :set_cuid_id
  
  # Get image URL for specific size
  def image_url(size: :medium)
    return nil unless image.present?
    
    case size.to_sym
    when :thumb
      generate_public_url(image, size: :thumb)
    when :medium
      generate_public_url(image, size: :medium)
    when :large
      generate_public_url(image, size: :large)
    when :original
      generate_public_url(image)
    else
      generate_public_url(image, size: :medium) # Default to medium
    end
  end
  
  # Check if this is the primary image
  def primary?
    position == 1
  end
  
  # Get image dimensions
  def dimensions(size: :medium)
    return nil unless image.present?
    
    metadata = case size.to_sym
                when :thumb
                  image(:thumb)&.metadata
                when :medium
                  image(:medium)&.metadata
                when :large
                  image(:large)&.metadata
                else
                  image&.metadata
                end
    
    return nil unless metadata
    
    {
      width: metadata["width"],
      height: metadata["height"]
    }
  end
  
  private
  
  def set_position
    self.position = (product.product_images.maximum(:position) || 0) + 1
  end
  
  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end