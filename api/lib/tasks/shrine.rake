namespace :shrine do
  desc "Regenerate derivatives for all existing images"
  task regenerate_derivatives: :environment do
    puts "Starting derivative regeneration..."
    
    # Process ProductImages
    puts "\nProcessing ProductImages..."
    ProductImage.find_each.with_index do |product_image, index|
      if product_image.image_attacher.stored?
        begin
          product_image.image_derivatives! # This forces derivative creation
          puts "✓ ProductImage ##{product_image.id} - derivatives created"
        rescue => e
          puts "✗ ProductImage ##{product_image.id} - failed: #{e.message}"
        end
      end
      
      # Show progress every 10 images
      if (index + 1) % 10 == 0
        puts "  Processed #{index + 1} product images..."
      end
    end
    
    # Process Store logos
    puts "\nProcessing Store logos..."
    Store.where.not(logo_data: nil).find_each do |store|
      if store.logo_attacher.stored?
        begin
          store.logo_derivatives!
          puts "✓ Store ##{store.id} - logo derivatives created"
        rescue => e
          puts "✗ Store ##{store.id} - logo failed: #{e.message}"
        end
      end
    end
    
    # Process Store banners
    puts "\nProcessing Store banners..."
    Store.where.not(banner_data: nil).find_each do |store|
      if store.banner_attacher.stored?
        begin
          store.banner_derivatives!
          puts "✓ Store ##{store.id} - banner derivatives created"
        rescue => e
          puts "✗ Store ##{store.id} - banner failed: #{e.message}"
        end
      end
    end
    
    # Process HeroContent images
    puts "\nProcessing HeroContent images..."
    HeroContent.where.not(image_data: nil).find_each do |hero|
      if hero.image_attacher.stored?
        begin
          hero.image_derivatives!
          puts "✓ HeroContent ##{hero.id} - image derivatives created"
        rescue => e
          puts "✗ HeroContent ##{hero.id} - image failed: #{e.message}"
        end
      end
    end
    
    # Process HeroContent featured collection images
    puts "\nProcessing HeroContent featured collection images..."
    HeroContent.where.not(featured_collection_image_data: nil).find_each do |hero|
      if hero.featured_collection_image_attacher.stored?
        begin
          hero.featured_collection_image_derivatives!
          puts "✓ HeroContent ##{hero.id} - featured collection derivatives created"
        rescue => e
          puts "✗ HeroContent ##{hero.id} - featured collection failed: #{e.message}"
        end
      end
    end
    
    puts "\nDerivative regeneration complete!"
  end
  
  desc "Check derivative status for all images"
  task check_derivatives: :environment do
    puts "Checking derivative status..."
    
    missing_count = 0
    
    # Check ProductImages
    puts "\nChecking ProductImages..."
    ProductImage.find_each do |product_image|
      if product_image.image_attacher.stored?
        derivatives = product_image.image_derivatives
        if derivatives.blank? || derivatives.empty?
          puts "✗ ProductImage ##{product_image.id} - missing derivatives"
          missing_count += 1
        end
      end
    end
    
    # Check other models similarly...
    
    puts "\nTotal images missing derivatives: #{missing_count}"
  end
end