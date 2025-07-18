module PublicImageUrls
  extend ActiveSupport::Concern

  private

  def generate_public_url(shrine_attachment, size: nil)
    return nil unless shrine_attachment.present?
    
    # Get the URL with presigning for Tigris
    url = if size
      # Check if derivative exists, fallback to original if not
      derivative = shrine_attachment.public_send(size) rescue nil
      if derivative
        # Generate presigned URL with 7 day expiration for Tigris
        derivative.url(expires_in: 7 * 24 * 60 * 60) # 7 days
      else
        # Fallback to original if derivative doesn't exist
        shrine_attachment.url(expires_in: 7 * 24 * 60 * 60) # 7 days
      end
    else
      shrine_attachment.url(expires_in: 7 * 24 * 60 * 60) # 7 days
    end
    
    return nil if url.blank?
    
    # For Tigris, return the presigned URL as-is
    # For local storage, ensure absolute URL
    if ENV["BUCKET_NAME"].present?
      url # Return presigned URL for Tigris
    else
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