const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

interface CreatePaymentIntentRequest {
  order_id: string
}

interface PaymentIntentResponse {
  client_secret: string
  payment_intent_id: string
  amount: number
  currency: string
}

interface ConfirmPaymentRequest {
  order_id: string
  payment_intent_id: string
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  async createPaymentIntent(orderId: string): Promise<PaymentIntentResponse> {
    const response = await fetch(`${API_BASE_URL}/payments/create_intent`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ order_id: orderId })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create payment intent')
    }

    return data.data
  }

  async confirmPayment(orderId: string, paymentIntentId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ 
        order_id: orderId,
        payment_intent_id: paymentIntentId 
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to confirm payment')
    }

    return data.data
  }

  getStripePublishableKey(): string {
    // In production, this should come from environment variables
    // For now, we'll return a test key placeholder
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key_here'
  }
}

const paymentService = new PaymentService()

export const createPaymentIntent = (orderId: string) => paymentService.createPaymentIntent(orderId)
export const confirmPayment = (orderId: string, paymentIntentId: string) => paymentService.confirmPayment(orderId, paymentIntentId)
export const getStripePublishableKey = () => paymentService.getStripePublishableKey()

export default paymentService