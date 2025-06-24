import { Cart, CartItem } from '@/types/api-generated'

const API_BASE = '/api/v1'

export interface AddToCartRequest {
  product_id: string
  quantity?: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

export const cartService = {
  // Get current user's cart
  async getCart(): Promise<Cart> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch cart')
    }

    const data = await response.json()
    return data.data
  },

  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add item to cart')
    }

    const data = await response.json()
    return data.data
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/cart/items/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update cart item')
    }

    const data = await response.json()
    return data.data
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<Cart> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/cart/items/${cartItemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to remove item from cart')
    }

    const data = await response.json()
    return data.data
  },

  // Clear entire cart
  async clearCart(): Promise<Cart> {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to clear cart')
    }

    const data = await response.json()
    return data.data
  },
}