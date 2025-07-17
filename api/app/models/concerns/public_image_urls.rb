module PublicImageUrls
  extend ActiveSupport::Concern

  private

  def generate_public_url(shrine_attachment, size: nil)
    return nil unless shrine_attachment.present?
    
    # Get the URL without presigning
    url = if size
      # Check if derivative exists, fallback to original if not
      derivative = shrine_attachment.public_send(size) rescue nil
      if derivative
        derivative.url
      else
        # Fallback to original if derivative doesn't exist
        shrine_attachment.url
      end
    else
      shrine_attachment.url
    end
    
    return nil if url.blank?
    
    # For Tigris, construct the direct public URL
    if ENV["BUCKET_NAME"].present?
      construct_tigris_public_url(url)
    else
      # Ensure URL is absolute for local storage
      ensure_absolute_url(url)
    end
  end
  
  def ensure_absolute_url(url)
    return nil if url.blank?
    return url if url.start_with?('http://', 'https://')
    
    # For relative URLs, prepend the host
    host = ENV.fetch('RAILS_HOST', 'http://localhost:5000')
    "#{host}#{url}"
  end
  
  def construct_tigris_public_url(url)
    return url if url.blank?
    
    # Extract the key from the URL
    if url.include?('?')
      # Remove query parameters (presigned URL parts)
      path = url.split('?').first
    else
      path = url
    end
    
    # Extract just the path after the bucket name
    if path.include?(ENV["BUCKET_NAME"])
      key = path.split("#{ENV["BUCKET_NAME"]}/").last
    else
      # If it's already just the key
      key = path.split('/').last
    end
    
    # Construct the public Tigris URL
    "https://fly.storage.tigris.dev/#{ENV["BUCKET_NAME"]}/#{key}"
  end
end