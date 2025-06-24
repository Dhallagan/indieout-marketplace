class ImageUploader < Shrine
  # Define derivatives (different sizes) with correct ImageProcessing syntax
  Attacher.derivatives do |original|
    magick = ImageProcessing::MiniMagick.source(original)
    
    {
      # Thumbnail for admin listings
      thumb: magick.resize_to_limit(150, 150).convert("webp").call,
      
      # Medium size for product pages  
      medium: magick.resize_to_limit(600, 600).convert("webp").call,
      
      # Large size for detailed views
      large: magick.resize_to_limit(1200, 1200).convert("webp").call
    }
  end

end