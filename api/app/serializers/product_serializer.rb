class ProductSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :slug, :description, :short_description, :base_price,
             :compare_at_price, :sku, :track_inventory, :inventory, :low_stock_threshold,
             :weight, :dimensions, :materials, :images, :videos, :meta_title,
             :meta_description, :status, :is_featured, :created_at, :updated_at,
             :option1_name, :option2_name, :option3_name

  belongs_to :store
  belongs_to :category

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
end