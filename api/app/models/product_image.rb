class ProductImage < ApplicationRecord
  include ImageUploader::Attachment[:image]
  
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
    
    # Generate presigned URL with expiration for S3/Tigris
    url = case size.to_sym
    when :thumb
      image(:thumb)&.url(expires_in: 7.days.to_i)
    when :medium
      image(:medium)&.url(expires_in: 7.days.to_i)
    when :large
      image(:large)&.url(expires_in: 7.days.to_i)
    when :original
      image&.url(expires_in: 7.days.to_i)
    else
      image(:medium)&.url(expires_in: 7.days.to_i) # Default to medium
    end
    
    # Ensure URL is absolute
    ensure_absolute_url(url)
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
  
  def ensure_absolute_url(url)
    return nil if url.blank?
    return url if url.start_with?('http://', 'https://')
    
    # For relative URLs, prepend the host
    host = ENV.fetch('RAILS_HOST', 'http://localhost:5000')
    "#{host}#{url}"
  end
end