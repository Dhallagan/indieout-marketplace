import { Order, ShippingAddress } from '@/types/api-generated'

const API_BASE = '/api/v1'

export interface CreateOrderRequest {
  shipping_address: ShippingAddress
  billing_address?: ShippingAddress
  payment_method?: string
}

export interface OrderListParams {
  page?: number
  per_page?: number
  status?: string
}

export const orderService = {
  // Get user's orders
  async getOrders(params?: OrderListParams): Promise<Order[]> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
    if (params?.status) searchParams.set('status', params.status)

    const response = await fetch(`${API_BASE}/orders?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    const data = await response.json()
    return data.data
  },

  // Get specific order
  async getOrder(orderId: string): Promise<Order> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order')
    }

    const data = await response.json()
    return data.data
  },

  // Create order from current cart
  async createOrder(orderData: CreateOrderRequest): Promise<Order[]> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: orderData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create order')
    }

    const data = await response.json()
    return Array.isArray(data.data) ? data.data : [data.data]
  },

  // Cancel order
  async cancelOrder(orderId: string): Promise<Order> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel order')
    }

    const data = await response.json()
    return data.data
  },

  // Fulfill order (for store owners)
  async fulfillOrder(orderId: string): Promise<Order> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/orders/${orderId}/fulfill`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fulfill order')
    }

    const data = await response.json()
    return data.data
  },
}