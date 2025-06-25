class RemoveImagesFromProducts < ActiveRecord::Migration[7.1]
  def change
    # Before removing, migrate existing images to ProductImage records
    reversible do |dir|
      dir.up do
        # Migrate existing JSON images to ProductImage records using Ruby
        # (SQL approach was complex due to JSON vs JSONB differences)
        Product.find_each do |product|
          next unless product.images.present? && product.images.is_a?(Array)
          
          product.images.each_with_index do |image_url, index|
            # Extract file ID from URL
            file_id = if image_url.include?('/uploads/store/')
              image_url.split('/uploads/store/').last
            elsif image_url.include?('/uploads/')
              image_url.split('/uploads/').last
            else
              image_url
            end
            
            # Create ProductImage record
            ProductImage.create!(
              id: SecureRandom.uuid,
              product_id: product.id,
              position: index + 1,
              image_data: {
                'id' => file_id,
                'storage' => 'store',
                'metadata' => {
                  'filename' => file_id.split('/').last
                }
              }.to_json
            )
          end
        end
      end
    end
    
    # Remove the images column
    remove_column :products, :images, :json
    # Also remove videos column if it exists (we'll focus on images for now)
    remove_column :products, :videos, :json if column_exists?(:products, :videos)
  end
end
