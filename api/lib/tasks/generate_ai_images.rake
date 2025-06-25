namespace :ai do
  desc "Generate AI images for products"
  task generate_images: :environment do
    puts '🎨 Generating AI images for products...'
    
    if ENV['OPENAI_API_KEY'].blank?
      puts '❌ No OpenAI API key found in environment variables'
      exit
    end
    
    puts "✅ OpenAI API key found, proceeding with image generation..."
    
    Product.limit(3).find_each do |product|
      puts "\n🎯 Processing: #{product.name}"
      puts "   Category: #{product.category&.name}"
      puts "   Description: #{product.description[0..80]}..."
      
      begin
        ai_image = AiImageService.generate_product_image(
          product.name, 
          product.description, 
          product.category&.name
        )
        
        if ai_image.present?
          # Replace first image with AI generated one
          new_images = [ai_image] + (product.images[1..-1] || [])
          product.update!(images: new_images)
          puts "   ✅ Generated and saved AI image: #{ai_image[0..60]}..."
        else
          puts "   ❌ Failed to generate AI image"
        end
        
        sleep(3) # Rate limiting
        
      rescue => e
        puts "   ❌ Error: #{e.message}"
      end
    end
    
    puts "\n🎉 Finished processing products!"
  end
end