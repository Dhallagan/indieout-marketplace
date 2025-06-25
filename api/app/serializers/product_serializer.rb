class ProductSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :slug, :description, :short_description, :base_price,
             :compare_at_price, :sku, :track_inventory, :inventory, :low_stock_threshold,
             :weight, :dimensions, :materials, :meta_title,
             :meta_description, :status, :is_featured, :created_at, :updated_at,
             :option1_name, :option2_name, :option3_name

  belongs_to :store
  belongs_to :category
  has_many :product_images

  attribute :price_range do |product|
    # For now, just return base_price as string
    product.base_price.to_s
  end

  attribute :total_inventory do |product|
    product.inventory
  end

  attribute :has_variants do |product|
    product.has_variants?
  end

  attribute :variant_count do |product|
    product.variant_count
  end

  attribute :stock_status do |product|
    product.stock_status
  end

  attribute :low_stock do |product|
    product.low_stock?
  end

  attribute :out_of_stock do |product|
    product.out_of_stock?
  end

  # Computed images array for backward compatibility
  attribute :images do |product|
    product.product_images.ordered.map do |product_image|
      # Try Shrine URL first, fallback to raw stored URL if Shrine can't process it
      if product_image.image_url.present?
        product_image.image_url
      elsif product_image.image_data.present?
        # Parse JSON string and extract the URL
        begin
          data = product_image.image_data.is_a?(String) ? JSON.parse(product_image.image_data) : product_image.image_data
          data['id']
        rescue JSON::ParserError
          nil
        end
      end
    end.compact
  end

  # Primary image for quick access
  attribute :primary_image do |product|
    primary_image = product.product_images.primary.first
    return nil unless primary_image
    
    if primary_image.image_url.present?
      primary_image.image_url
    elsif primary_image.image_data.present?
      begin
        data = primary_image.image_data.is_a?(String) ? JSON.parse(primary_image.image_data) : primary_image.image_data
        data['id']
      rescue JSON::ParserError
        nil
      end
    end
  end
end