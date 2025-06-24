import { Order, ShippingAddress } from '@/types/api-generated'
import { LocalCartItem } from '@/types/cart'

const API_BASE = '/api/v1'

export interface GuestOrderRequest {
  email: string
  shipping_address: ShippingAddress
  billing_address?: ShippingAddress
  payment_method?: string
  cart_items: {
    product_id: string
    quantity: number
  }[]
}

export interface GuestOrderTrackingRequest {
  order_number: string
  email: string
}

export const guestOrderService = {
  // Create guest order
  async createGuestOrder(orderData: GuestOrderRequest): Promise<Order[]> {
    const response = await fetch(`${API_BASE}/guest/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ guest_order: orderData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create guest order')
    }

    const data = await response.json()
    return Array.isArray(data.data) ? data.data : [data.data]
  },

  // Track guest order by order number and email
  async trackGuestOrder(trackingData: GuestOrderTrackingRequest): Promise<Order> {
    const { order_number, email } = trackingData
    const response = await fetch(`${API_BASE}/guest/orders/${order_number}?email=${encodeURIComponent(email)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to track order')
    }

    const data = await response.json()
    return data.data
  },

  // Convert local cart items to API format
  convertCartItems(cartItems: LocalCartItem[]): { product_id: string; quantity: number }[] {
    return cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }))
  },
}