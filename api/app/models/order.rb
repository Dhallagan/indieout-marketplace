class Order < ApplicationRecord
  belongs_to :user
  belongs_to :store
  has_many :order_items, dependent: :destroy
  has_many :products, through: :order_items

  enum status: {
    pending: 'pending',
    confirmed: 'confirmed',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
    refunded: 'refunded'
  }

  enum payment_status: {
    pending: 'pending',
    processing: 'processing',
    paid: 'paid',
    failed: 'failed',
    refunded: 'refunded'
  }

  validates :order_number, presence: true, uniqueness: true
  validates :status, presence: true
  validates :subtotal, :total_amount, presence: true, numericality: { greater_than: 0 }
  validates :shipping_cost, :tax_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :shipping_address, presence: true
  validates :payment_status, presence: true

  before_validation :generate_order_number, on: :create
  before_validation :calculate_totals

  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_payment_status, ->(payment_status) { where(payment_status: payment_status) }

  def total_items
    order_items.sum(:quantity)
  end

  def can_cancel?
    pending? || confirmed?
  end

  def can_fulfill?
    confirmed? && paid?
  end

  def fulfill!
    return false unless can_fulfill?
    
    transaction do
      update!(status: 'processing', fulfilled_at: Time.current)
      # Reduce inventory for each product
      order_items.each do |item|
        product = item.product
        if product.track_inventory && product.inventory >= item.quantity
          product.decrement(:inventory, item.quantity)
          product.save!
        end
      end
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def cancel!
    return false unless can_cancel?
    
    update(status: 'cancelled', cancelled_at: Time.current)
  end

  def formatted_address(type = :shipping)
    address = type == :shipping ? shipping_address : billing_address
    return nil unless address
    
    [
      address['address1'],
      address['address2'],
      "#{address['city']}, #{address['state']} #{address['zipCode']}",
      address['country']
    ].compact.join("\n")
  end

  def self.create_from_cart!(cart, shipping_address, billing_address = nil, payment_method = nil)
    return nil if cart.cart_items.empty?

    # Group cart items by store since each store needs a separate order
    cart.cart_items.includes(:product).group_by { |item| item.product.store }.map do |store, items|
      transaction do
        order = create!(
          user: cart.user,
          store: store,
          shipping_address: shipping_address,
          billing_address: billing_address || shipping_address,
          payment_method: payment_method,
          status: 'pending',
          payment_status: 'pending'
        )

        items.each do |cart_item|
          order.order_items.create!(
            product: cart_item.product,
            quantity: cart_item.quantity,
            unit_price: cart_item.product.base_price,
            total_price: cart_item.quantity * cart_item.product.base_price,
            product_snapshot: {
              name: cart_item.product.name,
              sku: cart_item.product.sku,
              description: cart_item.product.description,
              base_price: cart_item.product.base_price,
              images: cart_item.product.images
            }
          )
        end

        order.send(:calculate_totals)
        order.save!
        order
      end
    end
  end

  private

  def generate_order_number
    return if order_number.present?
    
    loop do
      self.order_number = "ORD-#{Time.current.strftime('%Y%m%d')}-#{SecureRandom.hex(4).upcase}"
      break unless self.class.exists?(order_number: order_number)
    end
  end

  def calculate_totals
    return unless order_items.any?
    
    self.subtotal = order_items.sum(&:total_price)
    self.shipping_cost ||= calculate_shipping_cost
    self.tax_amount ||= calculate_tax_amount
    self.total_amount = subtotal + shipping_cost + tax_amount
  end

  def calculate_shipping_cost
    # Free shipping over $100, otherwise $9.99
    subtotal >= 100 ? 0 : 9.99
  end

  def calculate_tax_amount
    # Simple 8% tax rate
    subtotal * 0.08
  end
end
