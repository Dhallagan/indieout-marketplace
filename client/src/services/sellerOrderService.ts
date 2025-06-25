import { Order } from '@/types/api-generated'

const API_BASE = '/api/v1'

export interface UpdateOrderStatusRequest {
  status: 'processing' | 'shipped' | 'delivered'
  tracking_number?: string
}

// Helper function to transform JSONAPI response
function transformJsonApiOrder(data: any): Order | Order[] {
  if (!data.data) {
    throw new Error('Invalid response format')
  }

  const included = data.included || []
  
  // Create lookup maps for included resources
  const orderItemsMap = new Map()
  const usersMap = new Map()
  const productsMap = new Map()
  
  included.forEach((item: any) => {
    if (item.type === 'order_item') {
      orderItemsMap.set(item.id, { id: item.id, ...item.attributes })
    } else if (item.type === 'user') {
      usersMap.set(item.id, { id: item.id, ...item.attributes })
    } else if (item.type === 'product') {
      productsMap.set(item.id, { id: item.id, ...item.attributes })
    }
  })

  // Transform single order
  const transformSingleOrder = (orderData: any) => {
    const order = { id: orderData.id, ...orderData.attributes } as any
    
    // Attach user (customer) if relationship exists
    if (orderData.relationships?.user?.data) {
      order.user = usersMap.get(orderData.relationships.user.data.id)
    }
    
    // Attach order items if relationship exists
    if (orderData.relationships?.order_items?.data) {
      order.order_items = orderData.relationships.order_items.data
        .map((orderItemRef: any) => {
          const orderItem = orderItemsMap.get(orderItemRef.id)
          
          // Attach product to order item if relationship exists
          if (orderItem) {
            const orderItemData = included.find((inc: any) => 
              inc.type === 'order_item' && inc.id === orderItemRef.id
            )
            if (orderItemData?.relationships?.product?.data) {
              orderItem.product = productsMap.get(orderItemData.relationships.product.data.id)
            }
          }
          
          return orderItem
        })
        .filter(Boolean)
    }
    
    return order as Order
  }

  // Handle array or single response
  if (Array.isArray(data.data)) {
    return data.data.map(transformSingleOrder)
  } else {
    return transformSingleOrder(data.data)
  }
}

export const sellerOrderService = {
  // Get orders for seller's store
  async getStoreOrders(params?: {
    status?: string
    search?: string
    page?: number
    per_page?: number
  }): Promise<Order[]> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const queryParams = new URLSearchParams()
    queryParams.append('store_orders', 'true')
    if (params?.status) queryParams.append('status', params.status)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString())
    
    const response = await fetch(`${API_BASE}/orders?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch orders')
    }

    const data = await response.json()
    const orders = transformJsonApiOrder(data)
    return Array.isArray(orders) ? orders : [orders]
  },

  // Update order status
  async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE}/orders/${orderId}/update_status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update order status')
    }

    const result = await response.json()
    const order = transformJsonApiOrder(result)
    return Array.isArray(order) ? order[0] : order
  },

  // Get single order for seller
  async getStoreOrder(orderId: string): Promise<Order> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('No authentication token found')
    }

    const response = await fetch(`${API_BASE}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch order')
    }

    const data = await response.json()
    const order = transformJsonApiOrder(data)
    return Array.isArray(order) ? order[0] : order
  }
}