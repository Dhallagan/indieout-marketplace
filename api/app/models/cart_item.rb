class CartItem < ApplicationRecord
  belongs_to :cart
  belongs_to :product

  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :added_at, presence: true

  before_validation :set_added_at, on: :create
  before_create :set_cuid_id

  def total_price
    quantity * product.base_price
  end

  def update_quantity(new_quantity)
    if new_quantity <= 0
      destroy
    else
      update(quantity: new_quantity)
    end
  end

  private

  def set_added_at
    self.added_at ||= Time.current
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end