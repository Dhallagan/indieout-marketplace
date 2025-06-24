class Cart < ApplicationRecord
  belongs_to :user
  has_many :cart_items, dependent: :destroy
  has_many :products, through: :cart_items

  validates :expires_at, presence: true

  scope :active, -> { where('expires_at > ?', Time.current) }
  scope :expired, -> { where('expires_at <= ?', Time.current) }

  before_create :set_expiration
  before_create :set_cuid_id

  def total_items
    cart_items.sum(:quantity)
  end

  def total_price
    cart_items.sum { |item| item.quantity * item.product.base_price }
  end

  def expired?
    expires_at <= Time.current
  end

  def extend_expiration(days = 30)
    update(expires_at: days.days.from_now)
  end

  def clear!
    cart_items.destroy_all
  end

  def add_product(product, quantity = 1)
    existing_item = cart_items.find_by(product: product)
    
    if existing_item
      existing_item.update(quantity: existing_item.quantity + quantity)
      existing_item
    else
      cart_items.create(
        product: product,
        quantity: quantity,
        added_at: Time.current
      )
    end
  end

  def remove_product(product)
    cart_items.find_by(product: product)&.destroy
  end

  def update_quantity(product, quantity)
    if quantity <= 0
      remove_product(product)
    else
      item = cart_items.find_by(product: product)
      item&.update(quantity: quantity)
    end
  end

  private

  def set_expiration
    self.expires_at ||= 30.days.from_now
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end