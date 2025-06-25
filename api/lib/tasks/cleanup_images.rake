namespace :images do
  desc "Clean up orphaned image files from storage"
  task cleanup_orphaned: :environment do
    puts "Starting orphaned image cleanup..."
    
    # Get all image IDs from ProductImage records
    db_image_ids = ProductImage.pluck(:image_data)
                              .map { |data| JSON.parse(data)['id'] if data }
                              .compact
    
    # Get all files from the store directory
    store_path = Rails.root.join('public', 'uploads', 'store')
    orphaned_count = 0
    
    if Dir.exist?(store_path)
      Dir.foreach(store_path) do |filename|
        next if ['.', '..'].include?(filename)
        
        file_id = filename.split('.').first
        file_path = store_path.join(filename)
        
        # Check if file exists in database
        unless db_image_ids.include?(file_id) || db_image_ids.include?(filename)
          puts "Orphaned file found: #{filename}"
          
          # Delete the file
          if ENV['DRY_RUN'] != 'false'
            puts "  -> Would delete: #{file_path} (dry run)"
          else
            File.delete(file_path)
            puts "  -> Deleted: #{file_path}"
          end
          
          orphaned_count += 1
        end
      end
    end
    
    puts "\nCleanup complete!"
    puts "#{orphaned_count} orphaned files #{ENV['DRY_RUN'] != 'false' ? 'found' : 'deleted'}"
    puts "\nTo actually delete files, run: rake images:cleanup_orphaned DRY_RUN=false"
  end
  
  desc "Report on image storage usage"
  task report: :environment do
    puts "Image Storage Report"
    puts "==================="
    
    # Database stats
    total_images = ProductImage.count
    products_with_images = Product.joins(:product_images).distinct.count
    
    puts "\nDatabase:"
    puts "  Total product images: #{total_images}"
    puts "  Products with images: #{products_with_images}"
    
    # File system stats
    store_path = Rails.root.join('public', 'uploads', 'store')
    cache_path = Rails.root.join('public', 'uploads', 'cache')
    
    if Dir.exist?(store_path)
      store_files = Dir.glob(File.join(store_path, '*')).select { |f| File.file?(f) }
      store_size = store_files.sum { |f| File.size(f) }
      
      puts "\nStore directory:"
      puts "  Files: #{store_files.count}"
      puts "  Total size: #{(store_size / 1024.0 / 1024.0).round(2)} MB"
    end
    
    if Dir.exist?(cache_path)
      cache_files = Dir.glob(File.join(cache_path, '*')).select { |f| File.file?(f) }
      cache_size = cache_files.sum { |f| File.size(f) }
      
      puts "\nCache directory:"
      puts "  Files: #{cache_files.count}"
      puts "  Total size: #{(cache_size / 1024.0 / 1024.0).round(2)} MB"
    end
    
    # Find products without images
    products_without_images = Product.left_joins(:product_images)
                                   .where(product_images: { id: nil })
                                   .count
    
    puts "\nProducts without images: #{products_without_images}"
  end
end