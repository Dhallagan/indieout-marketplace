import { Order, ShippingAddress } from '@/types/api-generated'

const API_BASE = '/api/v1'

export interface CreateOrderRequest {
  email?: string  // For guest checkout
  shipping_address?: ShippingAddress
  billing_address?: ShippingAddress
  payment_method?: string
  cart_items?: Array<{  // For guest checkout
    product_id: string
    quantity: number
  }>
}

export interface OrderListParams {
  page?: number
  per_page?: number
  status?: string
}

export const orderService = {
  // Get user's orders
  async getOrders(params?: OrderListParams): Promise<Order[]> {
    const token = localStorage.getItem('token')
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
    console.log('Orders API response:', data)
    
    // Handle JSONAPI response structure with included relationships
    if (data.data && Array.isArray(data.data)) {
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
      
      return data.data.map((item: any) => {
        const order = { id: item.id, ...item.attributes }
        
        // Attach store if relationship exists
        if (item.relationships?.store?.data) {
          order.store = storesMap.get(item.relationships.store.data.id)
        }
        
        // Attach order items if relationship exists
        if (item.relationships?.order_items?.data) {
          order.order_items = item.relationships.order_items.data.map((ref: any) => {
            const orderItem = orderItemsMap.get(ref.id)
            // Also attach product to order item if it exists
            if (orderItem && orderItem.product_id) {
              orderItem.product = productsMap.get(orderItem.product_id)
            }
            return orderItem
          }).filter(Boolean)
        }
        
        return order
      })
    }
    
    return data.data || []
  },

  // Get specific order
  async getOrder(orderId: string): Promise<Order> {
    const token = localStorage.getItem('token')
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
    console.log('Single order API response:', data)
    
    // Handle JSONAPI response structure with included relationships
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
      
      const order = { id: data.data.id, ...data.data.attributes }
      
      // Attach store if relationship exists
      if (data.data.relationships?.store?.data) {
        order.store = storesMap.get(data.data.relationships.store.data.id)
      }
      
      // Attach order items if relationship exists
      if (data.data.relationships?.order_items?.data) {
        order.order_items = data.data.relationships.order_items.data.map((ref: any) => {
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
    
    return data.data
  },

  // Create order from current cart (works for both authenticated and guest users)
  async createOrder(orderData: CreateOrderRequest): Promise<Order[]> {
    const token = localStorage.getItem('token')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Add auth header only if user is authenticated
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ order: orderData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create order')
    }

    const data = await response.json()
    console.log('Create order API response:', data)
    
    // Transform JSONAPI response similar to getOrders
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

  // Cancel order
  async cancelOrder(orderId: string): Promise<Order> {
    const token = localStorage.getItem('token')
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
    const token = localStorage.getItem('token')
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

  // Get order by order number (for guest checkout confirmation)
  async getOrderByNumber(orderNumber: string, email?: string): Promise<Order> {
    const params = new URLSearchParams()
    if (email) params.set('email', email)
    
    const response = await fetch(`${API_BASE}/orders/by_number/${orderNumber}?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order')
    }

    const data = await response.json()
    
    // Handle JSONAPI response
    if (data.data) {
      const included = data.included || []
      
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
      
      const order = { id: data.data.id, ...data.data.attributes }
      
      if (data.data.relationships?.store?.data) {
        order.store = storesMap.get(data.data.relationships.store.data.id)
      }
      
      if (data.data.relationships?.order_items?.data) {
        order.order_items = data.data.relationships.order_items.data.map((ref: any) => {
          const orderItem = orderItemsMap.get(ref.id)
          if (orderItem && orderItem.product_id) {
            orderItem.product = productsMap.get(orderItem.product_id)
          }
          return orderItem
        }).filter(Boolean)
      }
      
      return order
    }
    
    return data.data
  },
}