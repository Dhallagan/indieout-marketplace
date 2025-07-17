class Api::V1::PaymentsController < ApplicationController
  before_action :authenticate_user!, except: [:webhook, :create_intent, :confirm]
  before_action :set_order, only: [:create_intent, :confirm]

  # POST /api/v1/payments/create_intent
  def create_intent
    # For authenticated users, ensure order belongs to current user
    if current_user.present? && @order.user_id.present? && @order.user != current_user
      render json: { 
        success: false, 
        error: 'Not authorized' 
      }, status: :forbidden
      return
    end

    # Ensure order is in pending state
    unless @order.pending?
      render json: { 
        success: false, 
        error: 'Order cannot be paid' 
      }, status: :unprocessable_entity
      return
    end

    begin
      payment_data = StripePaymentService.create_payment_intent(
        order: @order,
        user: current_user || @order.user
      )

      render json: {
        success: true,
        data: payment_data
      }
    rescue StripePaymentService::PaymentError => e
      render json: {
        success: false,
        error: e.message
      }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/payments/confirm
  def confirm
    # For authenticated users, ensure order belongs to current user
    if current_user.present? && @order.user_id.present? && @order.user != current_user
      render json: { 
        success: false, 
        error: 'Not authorized' 
      }, status: :forbidden
      return
    end

    # This endpoint is called after Stripe.js confirms the payment
    # We'll verify the payment status and update the order
    result = StripePaymentService.confirm_payment(@order.payment_reference)

    if result[:success] && result[:status] == 'succeeded'
      @order.confirm_payment!
      
      render json: {
        success: true,
        data: {
          order: OrderSerializer.new(@order).serializable_hash[:data][:attributes]
        }
      }
    else
      render json: {
        success: false,
        error: result[:error] || 'Payment confirmation failed'
      }, status: :unprocessable_entity
    end
  end

  # POST /api/v1/payments/webhook
  # This endpoint will be called by Stripe webhooks
  def webhook
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']

    begin
      event = Stripe::Webhook.construct_event(
        payload, sig_header, endpoint_secret
      )
    rescue JSON::ParserError => e
      render json: { error: 'Invalid payload' }, status: :bad_request
      return
    rescue Stripe::SignatureVerificationError => e
      render json: { error: 'Invalid signature' }, status: :bad_request
      return
    end

    # Handle the event
    case event['type']
    when 'payment_intent.succeeded'
      handle_payment_succeeded(event['data']['object'])
    when 'payment_intent.payment_failed'
      handle_payment_failed(event['data']['object'])
    when 'charge.refunded'
      handle_refund(event['data']['object'])
    else
      Rails.logger.info "Unhandled Stripe event type: #{event['type']}"
    end

    render json: { received: true }
  end

  private

  def set_order
    @order = Order.find(params[:order_id])
  rescue ActiveRecord::RecordNotFound
    render json: { 
      success: false, 
      error: 'Order not found' 
    }, status: :not_found
  end

  def handle_payment_succeeded(payment_intent)
    order = Order.find_by(payment_reference: payment_intent['id'])
    return unless order

    # Update order status if not already confirmed
    if order.pending?
      order.confirm_payment!
      # TODO: Send order confirmation email
      # OrderMailer.confirmation(order).deliver_later
    end
  end

  def handle_payment_failed(payment_intent)
    order = Order.find_by(payment_reference: payment_intent['id'])
    return unless order

    # Update order status
    order.update!(
      payment_status: 'failed',
      notes: "Payment failed: #{payment_intent['last_payment_error']&.dig('message')}"
    )
    
    # TODO: Send payment failed email
    # OrderMailer.payment_failed(order).deliver_later
  end

  def handle_refund(charge)
    # Find order by payment intent
    payment_intent = Stripe::PaymentIntent.retrieve(charge['payment_intent'])
    order = Order.find_by(payment_reference: payment_intent['id'])
    return unless order

    # Update order status
    if charge['amount_refunded'] >= charge['amount']
      order.update!(status: 'refunded', payment_status: 'refunded')
    else
      order.update!(notes: "Partial refund: $#{charge['amount_refunded'] / 100.0}")
    end
  end
end