class ImageUploader < Shrine
  # Override storage location based on context
  plugin :default_storage, cache: :cache, store: ->(record, name) do
    case record
    when HeroContent
      :admin  # Admin storage for hero content
    when Product, ProductImage
      :products  # Product storage
    when Store
      :stores  # Store branding storage
    when User
      :avatars  # User avatar storage
    else
      :store  # Default storage
    end
  end

  # Add location prefix based on record type
  plugin :add_metadata
  plugin :determine_mime_type
  
  def generate_location(io, record: nil, name: nil, **)
    if record
      case record
      when Product, ProductImage
        # Organize products by store and product ID
        product = record.is_a?(ProductImage) ? record.product : record
        prefix = "#{product.store_id}/#{product.id}"
      when Store
        # Organize store assets by store ID
        prefix = record.id.to_s
      when User
        # Organize user avatars by user ID
        prefix = record.id.to_s
      when HeroContent
        # Admin content gets a simple structure
        prefix = "hero"
      else
        prefix = "misc"
      end
      
      # Generate a unique filename
      extension = File.extname(extract_filename(io).to_s).downcase
      extension = ".jpg" if extension.blank?
      filename = "#{SecureRandom.urlsafe_base64(16)}#{extension}"
      
      "#{prefix}/#{filename}"
    else
      super
    end
  end

  # Define derivatives (different sizes) using Vips for better performance
  Attacher.derivatives do |original|
    vips = ImageProcessing::Vips.source(original)
    
    {
      # Thumbnail for admin listings
      thumb: vips.resize_to_limit(150, 150).convert("webp").call,
      
      # Medium size for product pages  
      medium: vips.resize_to_limit(600, 600).convert("webp").call,
      
      # Large size for detailed views
      large: vips.resize_to_limit(1200, 1200).convert("webp").call,
      
      # Hero banner size (for hero content)
      hero: vips.resize_to_fill(1920, 800).convert("webp").saver(quality: 85).call,
      
      # Mobile hero size
      hero_mobile: vips.resize_to_fill(768, 600).convert("webp").saver(quality: 85).call
    }
  end

  private

  def extract_filename(io)
    if io.respond_to?(:original_filename)
      io.original_filename
    elsif io.respond_to?(:path)
      File.basename(io.path)
    else
      "image"
    end
  end
end