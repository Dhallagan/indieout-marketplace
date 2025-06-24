import { Order, ShippingAddress, CartItem } from '@/types/api-generated'

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
    console.log('Guest order API response:', data)
    
    // Transform JSONAPI response similar to authenticated orders
    if (data.data) {
      const included = data.included || []
      
      // Create lookup maps for included resources
      const orderItemsMap = new Map()
      const storesMap = new Map()
      const productsMap = new Map()
      
      included.forEach((item: any) => {
        if (item.type === 'order_item') {
          orderItemsMap.set(item.id, { id: item.id, ...item.attributes })
        } else if (item.type === 'store') {
          storesMap.set(item.id, { id: item.id, ...item.attributes })
        } else if (item.type === 'product') {
          productsMap.set(item.id, { id: item.id, ...item.attributes })
        }
      })
      
      const transformOrder = (orderData: any) => {
        const order = { id: orderData.id, ...orderData.attributes }
        
        // Attach store if relationship exists
        if (orderData.relationships?.store?.data) {
          order.store = storesMap.get(orderData.relationships.store.data.id)
        }
        
        // Attach order items if relationship exists
        if (orderData.relationships?.order_items?.data) {
          order.order_items = orderData.relationships.order_items.data.map((ref: any) => {
            const orderItem = orderItemsMap.get(ref.id)
            // Also attach product to order item if it exists
            if (orderItem && orderItem.product_id) {
              orderItem.product = productsMap.get(orderItem.product_id)
            }
            return orderItem
          }).filter(Boolean)
        }
        
        return order
      }
      
      return Array.isArray(data.data) 
        ? data.data.map(transformOrder)
        : [transformOrder(data.data)]
    }
    
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

  // Convert Rails API cart items to order format
  convertCartItems(cartItems: CartItem[]): { product_id: string; quantity: number }[] {
    return cartItems.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }))
  },
}