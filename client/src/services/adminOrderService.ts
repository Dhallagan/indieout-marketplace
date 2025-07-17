import { Order } from '@/types/api-generated'

const API_BASE = '/api/v1/admin/orders'

export interface AdminOrderListParams {
  page?: number
  per_page?: number
  status?: string
  payment_status?: string
  store_id?: string
  search?: string
  start_date?: string
  end_date?: string
}

export interface OrderStats {
  total_orders: number
  total_revenue: number
  recent_orders: number
  recent_revenue: number
  status_breakdown: Record<string, number>
  payment_status_breakdown: Record<string, number>
  daily_orders: Array<{ date: string; count: number }>
  top_stores: Array<{ id: string; name: string; order_count: number }>
}

export interface OrderListResponse {
  data: any // JSONAPI response
  meta: {
    current_page: number
    per_page: number
    total_count: number
    total_pages: number
  }
}

export const adminOrderService = {
  // Get all orders (admin view)
  async getOrders(params?: AdminOrderListParams): Promise<{ orders: Order[]; meta: any }> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.payment_status) searchParams.set('payment_status', params.payment_status)
    if (params?.store_id) searchParams.set('store_id', params.store_id)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.start_date) searchParams.set('start_date', params.start_date)
    if (params?.end_date) searchParams.set('end_date', params.end_date)

    const response = await fetch(`${API_BASE}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch orders')
    }

    const data: OrderListResponse = await response.json()
    console.log('Admin orders API response:', data)
    
    // Transform JSONAPI response
    if (data.data) {
      const included = data.data.included || []
      
      // Create lookup maps
      const usersMap = new Map()
      const storesMap = new Map()
      const orderItemsMap = new Map()
      const productsMap = new Map()
      
      included.forEach((item: any) => {
        if (item.type === 'user') {
          usersMap.set(item.id, { id: item.id, ...item.attributes })
        } else if (item.type === 'store') {
          storesMap.set(item.id, { id: item.id, ...item.attributes })
        } else if (item.type === 'order_item') {
          orderItemsMap.set(item.id, { id: item.id, ...item.attributes })
        } else if (item.type === 'product') {
          productsMap.set(item.id, { id: item.id, ...item.attributes })
        }
      })
      
      const orders = data.data.data.map((item: any) => {
        const order = { id: item.id, ...item.attributes }
        
        // Attach user
        if (item.relationships?.user?.data) {
          order.user = usersMap.get(item.relationships.user.data.id)
        }
        
        // Attach store
        if (item.relationships?.store?.data) {
          order.store = storesMap.get(item.relationships.store.data.id)
        }
        
        // Attach order items
        if (item.relationships?.order_items?.data) {
          order.order_items = item.relationships.order_items.data.map((ref: any) => {
            const orderItem = orderItemsMap.get(ref.id)
            if (orderItem && orderItem.product_id) {
              orderItem.product = productsMap.get(orderItem.product_id)
            }
            return orderItem
          }).filter(Boolean)
        }
        
        return order
      })
      
      return { orders, meta: data.meta }
    }
    
    return { orders: [], meta: data.meta }
  },

  // Get order statistics
  async getStats(): Promise<OrderStats> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch order statistics')
    }

    return response.json()
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/${orderId}/update_status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update order status')
    }

    const data = await response.json()
    
    // Transform JSONAPI response
    if (data.data) {
      const order = { id: data.data.id, ...data.data.attributes }
      
      // Handle included resources if needed
      if (data.included) {
        // Process included data similar to getOrders
      }
      
      return order
    }
    
    return data
  },

  // Process refund
  async refundOrder(orderId: string, amount?: number, reason?: string): Promise<Order> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const body: any = {}
    if (amount !== undefined) body.amount = amount
    if (reason) body.reason = reason

    const response = await fetch(`${API_BASE}/${orderId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to process refund')
    }

    const data = await response.json()
    
    // Transform JSONAPI response
    if (data.data) {
      return { id: data.data.id, ...data.data.attributes }
    }
    
    return data
  },
}