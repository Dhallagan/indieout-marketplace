class CartItemSerializer
  include JSONAPI::Serializer
  
  attributes :quantity, :added_at

  belongs_to :cart
  belongs_to :product

  attribute :total_price do |cart_item|
    cart_item.total_price
  end
end