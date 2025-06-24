import { Product, Cart as ApiCart, CartItem as ApiCartItem } from './api-generated'

// Local cart types for localStorage (will migrate to API)
export interface LocalCartItem {
  id: string
  product: Product
  quantity: number
  variant?: any // For future use
  addedAt: Date
}

export interface LocalCart {
  items: LocalCartItem[]
  totalItems: number
  totalPrice: number
  updatedAt: Date
}

// Cart context interface supporting both local and API carts
export interface CartContextType {
  cart: LocalCart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => LocalCartItem | undefined
}

// Export API cart types for future use
export type { ApiCart, ApiCartItem }