import { Cart, CartItem } from '@/types/api-generated'

const API_BASE = '/api/v1'
const CART_TOKEN_KEY = 'cart_token'

interface CartResponse {
  data: {
    id: string
    type: string
    attributes: Cart
    relationships?: {
      cart_items: {
        data: Array<{ id: string; type: string }>
      }
    }
  }
  included?: Array<{
    id: string
    type: string
    attributes: CartItem | any
  }>
  cart_token?: string
}

export interface AddToCartRequest {
  product_id: string
  quantity?: number
  cart_token?: string
}

export interface UpdateCartItemRequest {
  quantity: number
  cart_token?: string
}

export const cartService = {
  // Get current cart (works for both authenticated and guest users)
  async getCart(): Promise<{ cart: Cart; cartToken?: string }> {
    const token = localStorage.getItem('token')
    const cartToken = localStorage.getItem(CART_TOKEN_KEY)
    const url = new URL(`${API_BASE}/cart`, window.location.origin)
    
    if (cartToken && !token) {
      url.searchParams.append('cart_token', cartToken)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch cart')
    }

    const data: CartResponse = await response.json()
    const cart = this.transformCartResponse(data)
    
    return { cart, cartToken: data.cart_token }
  },

  // Add item to cart (works for both authenticated and guest users)
  async addToCart(productId: string, quantity: number = 1): Promise<{ cart: Cart; cartToken?: string }> {
    const token = localStorage.getItem('token')
    const cartToken = localStorage.getItem(CART_TOKEN_KEY)
    
    const requestData: AddToCartRequest = {
      product_id: productId,
      quantity
    }
    
    if (cartToken && !token) {
      requestData.cart_token = cartToken
    }

    const response = await fetch(`${API_BASE}/cart/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to add item to cart')
    }

    const data: CartResponse = await response.json()
    const cart = this.transformCartResponse(data)
    
    // Store cart token for guest users
    if (data.cart_token && !token) {
      localStorage.setItem(CART_TOKEN_KEY, data.cart_token)
    }
    
    return { cart, cartToken: data.cart_token }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId: string, quantity: number): Promise<Cart> {
    const token = localStorage.getItem('token')
    const cartToken = localStorage.getItem(CART_TOKEN_KEY)
    
    const requestData: UpdateCartItemRequest = { quantity }
    if (cartToken && !token) {
      requestData.cart_token = cartToken
    }

    const response = await fetch(`${API_BASE}/cart/items/${cartItemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify(requestData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update cart item')
    }

    const data: CartResponse = await response.json()
    return this.transformCartResponse(data)
  },

  // Remove item from cart
  async removeFromCart(cartItemId: string): Promise<Cart> {
    const token = localStorage.getItem('token')
    const cartToken = localStorage.getItem(CART_TOKEN_KEY)
    const url = new URL(`${API_BASE}/cart/items/${cartItemId}`, window.location.origin)
    
    if (cartToken && !token) {
      url.searchParams.append('cart_token', cartToken)
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to remove item from cart')
    }

    const data: CartResponse = await response.json()
    return this.transformCartResponse(data)
  },

  // Clear entire cart
  async clearCart(): Promise<Cart> {
    const token = localStorage.getItem('token')
    const cartToken = localStorage.getItem(CART_TOKEN_KEY)
    const url = new URL(`${API_BASE}/cart`, window.location.origin)
    
    if (cartToken && !token) {
      url.searchParams.append('cart_token', cartToken)
    }

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    })

    if (!response.ok) {
      throw new Error('Failed to clear cart')
    }

    const data: CartResponse = await response.json()
    return this.transformCartResponse(data)
  },

  // Clear cart token (for logout)
  clearCartToken(): void {
    localStorage.removeItem(CART_TOKEN_KEY)
  },

  // Transform Rails JSONAPI response to our Cart type
  transformCartResponse(data: CartResponse): Cart {
    const cart = { id: data.data.id, ...data.data.attributes }
    
    // Transform included cart_items if present
    if (data.included) {
      const cartItems = data.included
        .filter(item => item.type === 'cart_item')
        .map(item => ({ id: item.id, ...item.attributes }))
      
      const products = data.included
        .filter(item => item.type === 'product')
        .reduce((acc, item) => {
          acc[item.id] = { id: item.id, ...item.attributes }
          return acc
        }, {} as any)
      
      // Attach products to cart items
      cart.cart_items = cartItems.map((item: any) => ({
        ...item,
        product: products[item.product_id] || item.product
      }))
    } else {
      cart.cart_items = cart.cart_items || []
    }
    
    return cart
  }
}