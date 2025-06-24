class CartSerializer
  include JSONAPI::Serializer
  
  attributes :expires_at, :created_at, :updated_at

  belongs_to :user
  has_many :cart_items

  attribute :total_items do |cart|
    cart.total_items
  end

  attribute :total_price do |cart|
    cart.total_price
  end

  attribute :expired do |cart|
    cart.expired?
  end
end