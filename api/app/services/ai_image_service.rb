require 'net/http'
require 'json'
require 'uri'

class AiImageService
  class << self
    def generate_product_image(product_name, description, category = nil)
      api_key = Rails.application.credentials.openai_api_key || ENV['OPENAI_API_KEY']
      return nil unless api_key.present?
      
      prompt = build_product_prompt(product_name, description, category)
      
      Rails.logger.info "Generating AI image with prompt: #{prompt}"
      
      begin
        response = call_openai_api(prompt)
        
        if response['data'] && response['data'].any?
          image_url = response['data'].first['url']
          Rails.logger.info "Successfully generated image: #{image_url}"
          return image_url
        else
          Rails.logger.error "No image data returned from OpenAI"
          return fallback_image_url(category)
        end
        
      rescue => e
        Rails.logger.error "Failed to generate AI image: #{e.message}"
        return fallback_image_url(category)
      end
    end
    
    def generate_multiple_images(product_name, description, category = nil, count = 3)
      api_key = Rails.application.credentials.openai_api_key || ENV['OPENAI_API_KEY']
      return Array.new(count) { fallback_image_url(category) } unless api_key.present?
      
      prompt = build_product_prompt(product_name, description, category)
      
      Rails.logger.info "Generating #{count} AI images with prompt: #{prompt}"
      
      begin
        response = call_openai_api(prompt, count)
        
        if response['data'] && response['data'].any?
          images = response['data'].map { |img| img['url'] }
          Rails.logger.info "Successfully generated #{images.length} images"
          
          # Fill with fallback images if we didn't get enough
          while images.length < count
            images << fallback_image_url(category)
          end
          
          return images.first(count)
        else
          Rails.logger.error "No image data returned from OpenAI"
          return Array.new(count) { fallback_image_url(category) }
        end
        
      rescue => e
        Rails.logger.error "Failed to generate AI images: #{e.message}"
        return Array.new(count) { fallback_image_url(category) }
      end
    end
    
    private
    
    def build_product_prompt(product_name, description, category)
      # Extract key features from description
      key_features = extract_key_features(description)
      
      # Base prompt for professional product photography
      base_prompt = "Professional product photography of #{product_name}"
      
      # Add category-specific styling
      category_style = case category&.downcase
      when 'hiking', 'backpacks', 'boots'
        ", outdoor hiking equipment"
      when 'climbing', 'ropes', 'harnesses'
        ", rock climbing gear"
      when 'camping', 'tents', 'sleeping bags'
        ", camping equipment"
      else
        ", outdoor gear"
      end
      
      # Add key features if available
      features_text = key_features.any? ? ", featuring #{key_features.join(' and ')}" : ""
      
      # Professional photography requirements
      photo_style = ", clean white background, studio lighting, high quality commercial product photography, professional e-commerce style, detailed, sharp focus, 4K resolution"
      
      prompt = "#{base_prompt}#{category_style}#{features_text}#{photo_style}"
      
      # Ensure prompt isn't too long (DALL-E has a limit)
      prompt.length > 400 ? prompt[0, 400] : prompt
    end
    
    def extract_key_features(description)
      return [] if description.blank?
      
      # Common outdoor gear features to highlight
      features = []
      
      # Materials
      features << "waterproof" if description.match?(/waterproof|water.resistant/i)
      features << "lightweight" if description.match?(/lightweight|ultralight|light.?weight/i)
      features << "durable" if description.match?(/durable|rugged|tough/i)
      features << "carbon fiber" if description.match?(/carbon.fiber/i)
      features << "leather" if description.match?(/leather/i)
      features << "down insulation" if description.match?(/down|fill.power/i)
      
      # Colors/finishes
      features << "black finish" if description.match?(/black|dark/i)
      features << "orange accents" if description.match?(/orange/i)
      features << "blue details" if description.match?(/blue/i)
      
      features.first(3) # Limit to top 3 features
    end
    
    def call_openai_api(prompt, count = 1)
      uri = URI('https://api.openai.com/v1/images/generations')
      
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.read_timeout = 60 # 60 seconds timeout
      
      request = Net::HTTP::Post.new(uri)
      api_key = Rails.application.credentials.openai_api_key || ENV['OPENAI_API_KEY']
      request['Authorization'] = "Bearer #{api_key}"
      request['Content-Type'] = 'application/json'
      
      request.body = {
        model: "dall-e-3",
        prompt: prompt,
        n: [count, 1].min, # DALL-E 3 only supports n=1
        size: "1024x1024",
        quality: "standard",
        style: "natural"
      }.to_json
      
      response = http.request(request)
      
      unless response.code == '200'
        Rails.logger.error "OpenAI API error: #{response.code} - #{response.body}"
        raise "OpenAI API returned #{response.code}: #{response.body}"
      end
      
      JSON.parse(response.body)
    end
    
    def fallback_image_url(category)
      # Return curated Unsplash images as fallback
      case category&.downcase
      when 'hiking', 'backpacks'
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5c?w=400&h=400&fit=crop"
      when 'climbing', 'ropes', 'harnesses'
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=400&h=400&fit=crop"
      when 'camping', 'tents', 'sleeping bags'
        "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&h=400&fit=crop"
      when 'boots'
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop"
      else
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop"
      end
    end
  end
end