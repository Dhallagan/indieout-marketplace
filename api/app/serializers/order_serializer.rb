class OrderSerializer
  include JSONAPI::Serializer
  
  attributes :order_number, :status, :payment_status, :subtotal, :shipping_cost, 
             :tax_amount, :total_amount, :shipping_address, :billing_address,
             :payment_method, :payment_reference, :tracking_number, :notes, :fulfilled_at, 
             :cancelled_at, :created_at, :updated_at

  belongs_to :user
  belongs_to :store
  has_many :order_items

  attribute :total_items do |order|
    order.total_items
  end

  attribute :formatted_shipping_address do |order|
    order.formatted_address(:shipping)
  end

  attribute :formatted_billing_address do |order|
    order.formatted_address(:billing)
  end

  attribute :can_cancel do |order|
    order.can_cancel?
  end

  attribute :can_fulfill do |order|
    order.can_fulfill?
  end

  attribute :customer_status do |order|
    case order.status
    when 'pending'
      'Order Received'
    when 'confirmed'
      'Payment Confirmed'
    when 'processing'
      'Preparing Order'
    when 'shipped'
      'Shipped'
    when 'delivered'
      'Delivered'
    when 'cancelled'
      'Cancelled'
    when 'refunded'
      'Refunded'
    else
      order.status.humanize
    end
  end
end