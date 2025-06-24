import { Product } from './api-generated'

export interface CartItem {
  id: string
  product: Product
  quantity: number
  variant?: any // For future use
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  updatedAt: Date
}

export interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => CartItem | undefined
}