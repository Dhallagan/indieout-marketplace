class OrderItemSerializer
  include JSONAPI::Serializer
  
  attributes :order_id, :product_id, :quantity, :unit_price, :total_price, :product_snapshot

  belongs_to :order
  belongs_to :product

  attribute :product_name do |order_item|
    order_item.product_name
  end

  attribute :product_sku do |order_item|
    order_item.product_sku
  end

  attribute :product_image do |order_item|
    order_item.product_image
  end
end