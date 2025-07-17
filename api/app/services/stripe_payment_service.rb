class StripePaymentService
  class PaymentError < StandardError; end

  def self.create_payment_intent(order:, user:)
    begin
      # Create or retrieve Stripe customer
      customer = find_or_create_customer(user)

      # Create payment intent
      payment_intent = Stripe::PaymentIntent.create({
        amount: (order.total_amount * 100).to_i, # Amount in cents
        currency: 'usd',
        customer: customer.id,
        metadata: {
          order_id: order.id,
          order_number: order.order_number
        },
        description: "Order #{order.order_number}",
        # Automatically capture the payment
        capture_method: 'automatic',
        # Include shipping address
        shipping: {
          name: "#{order.shipping_address['firstName']} #{order.shipping_address['lastName']}",
          address: {
            line1: order.shipping_address['address1'],
            line2: order.shipping_address['address2'],
            city: order.shipping_address['city'],
            state: order.shipping_address['state'],
            postal_code: order.shipping_address['zipCode'],
            country: order.shipping_address['country'] || 'US'
          }
        }
      })

      # Store payment intent ID on order
      order.update!(payment_reference: payment_intent.id)

      {
        client_secret: payment_intent.client_secret,
        payment_intent_id: payment_intent.id,
        amount: payment_intent.amount,
        currency: payment_intent.currency
      }
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe error: #{e.message}"
      raise PaymentError, "Payment processing error: #{e.message}"
    end
  end

  def self.confirm_payment(payment_intent_id)
    begin
      payment_intent = Stripe::PaymentIntent.retrieve(payment_intent_id)
      
      case payment_intent.status
      when 'succeeded'
        { success: true, status: 'succeeded' }
      when 'processing'
        { success: true, status: 'processing' }
      when 'requires_payment_method'
        { success: false, status: 'requires_payment_method', error: 'Payment method required' }
      when 'requires_action'
        { success: false, status: 'requires_action', error: 'Additional authentication required' }
      else
        { success: false, status: payment_intent.status, error: 'Payment failed' }
      end
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe confirmation error: #{e.message}"
      { success: false, error: e.message }
    end
  end

  def self.create_refund(order:, amount: nil, reason: 'requested_by_customer')
    begin
      # Retrieve the payment intent
      payment_intent = Stripe::PaymentIntent.retrieve(order.payment_reference)
      
      # Get the charge ID from the payment intent
      charge_id = payment_intent.charges.data.first&.id
      raise PaymentError, "No charge found for order" unless charge_id

      # Create refund
      refund_params = {
        charge: charge_id,
        reason: reason,
        metadata: {
          order_id: order.id,
          order_number: order.order_number
        }
      }
      
      # Add amount if partial refund
      refund_params[:amount] = (amount * 100).to_i if amount

      refund = Stripe::Refund.create(refund_params)

      {
        success: true,
        refund_id: refund.id,
        amount: refund.amount,
        status: refund.status
      }
    rescue Stripe::StripeError => e
      Rails.logger.error "Stripe refund error: #{e.message}"
      { success: false, error: e.message }
    end
  end

  private

  def self.find_or_create_customer(user)
    # Check if user already has a Stripe customer ID
    if user.stripe_customer_id.present?
      begin
        return Stripe::Customer.retrieve(user.stripe_customer_id)
      rescue Stripe::InvalidRequestError
        # Customer doesn't exist, create new one
      end
    end

    # Create new customer
    customer = Stripe::Customer.create({
      email: user.email,
      name: "#{user.first_name} #{user.last_name}",
      metadata: {
        user_id: user.id
      }
    })

    # Store customer ID for future use
    user.update_column(:stripe_customer_id, customer.id)
    
    customer
  end
end