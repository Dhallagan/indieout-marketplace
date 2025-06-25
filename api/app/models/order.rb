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
    payment_pending: 'pending',
    payment_processing: 'processing',
    paid: 'paid',
    payment_failed: 'failed',
    payment_refunded: 'refunded'
  }

  validates :order_number, presence: true, uniqueness: true
  validates :status, presence: true
  validates :subtotal, :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :subtotal, :total_amount, numericality: { greater_than: 0 }, if: :order_items_present?
  validates :shipping_cost, :tax_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :shipping_address, presence: true
  validates :payment_status, presence: true

  before_validation :generate_order_number, on: :create
  before_create :set_cuid_id
  after_create :send_order_confirmation_email
  after_update :send_status_update_email, if: :saved_change_to_status?

  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_payment_status, ->(payment_status) { where(payment_status: payment_status) }

  def total_items
    order_items.sum(:quantity)
  end

  def order_items_present?
    order_items.any?
  end

  def can_cancel?
    pending? || confirmed?
  end

  def can_fulfill?
    confirmed? && paid?
  end

  def fulfill!
    return false unless can_fulfill?
    
    update!(status: 'shipped', fulfilled_at: Time.current)
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def confirm_payment!
    return false unless pending?
    
    transaction do
      update!(status: 'confirmed', payment_status: 'paid')
      reduce_inventory!
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
  end

  def cancel!
    return false unless can_cancel?
    
    transaction do
      restore_inventory! if confirmed? || processing?
      update!(status: 'cancelled', cancelled_at: Time.current)
    end
    true
  rescue ActiveRecord::RecordInvalid
    false
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
      # Check inventory for all items before creating order
      inventory_errors = []
      items.each do |cart_item|
        product = cart_item.product
        if product.track_inventory 
          available_stock = product.total_inventory
          if available_stock < cart_item.quantity
            inventory_errors << "#{product.name} only has #{available_stock} in stock (you requested #{cart_item.quantity})"
          end
        end
      end
      
      # Raise error if any items are out of stock
      unless inventory_errors.empty?
        raise StandardError.new("Insufficient inventory: #{inventory_errors.join(', ')}")
      end

      transaction do
        order = create!(
          user: cart.user,
          store: store,
          shipping_address: shipping_address,
          billing_address: billing_address || shipping_address,
          payment_method: payment_method,
          status: 'pending',
          payment_status: 'payment_pending',
          subtotal: 0,
          shipping_cost: 0,
          tax_amount: 0,
          total_amount: 0
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

        # Calculate totals after order items are created
        order.reload # Reload to get the order_items
        Rails.logger.debug "Order #{order.id} has #{order.order_items.count} items"
        order.order_items.each do |item|
          Rails.logger.debug "Item: #{item.product.name} - Qty: #{item.quantity} - Price: #{item.total_price}"
        end
        
        order.send(:calculate_totals)
        Rails.logger.debug "Calculated subtotal: #{order.subtotal}, total: #{order.total_amount}"
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

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end

  def calculate_totals
    # Calculate subtotal from order items
    calculated_subtotal = order_items.any? ? order_items.sum(&:total_price) : 0
    self.subtotal = calculated_subtotal
    
    # Calculate shipping and tax based on the subtotal
    self.shipping_cost ||= (calculated_subtotal >= 100 ? 0 : 9.99)
    self.tax_amount ||= (calculated_subtotal * 0.08)
    self.total_amount = self.subtotal + self.shipping_cost + self.tax_amount
  end

  def calculate_shipping_cost
    # Free shipping over $100, otherwise $9.99
    subtotal >= 100 ? 0 : 9.99
  end

  def calculate_tax_amount
    # Simple 8% tax rate
    subtotal * 0.08
  end

  def send_order_confirmation_email
    # Send email asynchronously to avoid blocking order creation
    OrderMailer.order_confirmation(self).deliver_later
  end

  def send_status_update_email
    # Don't send email for initial 'pending' status or if status hasn't actually changed
    return if status == 'pending' && status_previous_change&.first.nil?
    
    previous_status = status_previous_change&.first
    OrderMailer.order_status_update(self, previous_status).deliver_later
  end

  def reduce_inventory!
    order_items.each do |item|
      product = item.product
      if product.track_inventory
        # Check if product has variants
        if product.has_variants?
          # For products with variants, we need to reduce inventory from the specific variant
          # For now, reduce from base product inventory
          if product.inventory >= item.quantity
            product.decrement!(:inventory, item.quantity)
          else
            raise StandardError.new("Insufficient inventory for #{product.name}")
          end
        else
          # Simple product - reduce from main inventory
          if product.inventory >= item.quantity
            product.decrement!(:inventory, item.quantity)
          else
            raise StandardError.new("Insufficient inventory for #{product.name}")
          end
        end
      end
    end
  end

  def restore_inventory!
    order_items.each do |item|
      product = item.product
      if product.track_inventory
        product.increment!(:inventory, item.quantity)
      end
    end
  end
end
