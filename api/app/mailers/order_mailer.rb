class OrderMailer < ApplicationMailer
  
  def order_confirmation(order)
    @order = order
    @user = order.user
    @order_items = order.order_items.includes(:product)
    @shipping_address = parse_address(@order.shipping_address)
    
    mail(
      to: @user.email,
      subject: "Order Confirmation - #{@order.order_number}"
    )
  end

  def order_status_update(order, previous_status = nil)
    @order = order
    @user = order.user
    @previous_status = previous_status
    @status_message = get_status_message(@order.status)
    
    mail(
      to: @user.email,
      subject: "Order Update - #{@order.order_number}"
    )
  end

  def shipping_confirmation(order, tracking_number = nil)
    @order = order
    @user = order.user
    @tracking_number = tracking_number
    @order_items = order.order_items.includes(:product)
    @shipping_address = parse_address(@order.shipping_address)
    
    mail(
      to: @user.email,
      subject: "Your order has shipped - #{@order.order_number}"
    )
  end

  private

  def parse_address(address_data)
    if address_data.is_a?(String)
      # If it's JSON string, parse it
      JSON.parse(address_data)
    elsif address_data.is_a?(Hash)
      # If it's already a hash, return as is
      address_data
    else
      # Fallback
      {}
    end
  rescue JSON::ParserError
    {}
  end

  def get_status_message(status)
    case status
    when 'pending'
      "We've received your order and it's being prepared."
    when 'confirmed'
      "Your order has been confirmed and is being processed."
    when 'processing'
      "Your order is currently being prepared for shipment."
    when 'shipped'
      "Great news! Your order has been shipped and is on its way to you."
    when 'delivered'
      "Your order has been delivered. We hope you love your new gear!"
    when 'cancelled'
      "Your order has been cancelled. If you have any questions, please contact us."
    when 'refunded'
      "Your order has been refunded. Please allow 3-5 business days for the refund to appear."
    else
      "Your order status has been updated."
    end
  end
end
