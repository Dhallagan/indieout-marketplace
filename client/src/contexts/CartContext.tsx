import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Cart } from '@/types/api-generated'
import { cartService } from '@/services/cartService'
import { useToast } from '@/contexts/ToastContext'

interface CartContextType {
  cart: Cart | null
  loading: boolean
  addToCart: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  removeFromCart: (cartItemId: string) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (productId: string) => boolean
  getCartItem: (productId: string) => any | undefined
  refreshCart: () => Promise<void>
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Cart provider component
interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()
  
  // Load cart on mount
  useEffect(() => {
    refreshCart()
  }, [])
  
  const refreshCart = async () => {
    try {
      setLoading(true)
      const { cart: fetchedCart } = await cartService.getCart()
      setCart(fetchedCart)
    } catch (error) {
      console.error('Failed to load cart:', error)
      // Don't show error toast on initial load, cart might not exist yet
    } finally {
      setLoading(false)
    }
  }
  
  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const { cart: updatedCart } = await cartService.addToCart(productId, quantity)
      setCart(updatedCart)
      addToast('Added to cart', 'success')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      addToast(error instanceof Error ? error.message : 'Failed to add to cart', 'error')
      throw error
    }
  }
  
  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateCartItem(cartItemId, quantity)
      setCart(updatedCart)
    } catch (error) {
      console.error('Failed to update cart item:', error)
      addToast(error instanceof Error ? error.message : 'Failed to update cart', 'error')
      throw error
    }
  }
  
  const removeFromCart = async (cartItemId: string) => {
    try {
      const updatedCart = await cartService.removeFromCart(cartItemId)
      setCart(updatedCart)
      addToast('Removed from cart', 'success')
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      addToast(error instanceof Error ? error.message : 'Failed to remove from cart', 'error')
      throw error
    }
  }
  
  const clearCart = async () => {
    try {
      const updatedCart = await cartService.clearCart()
      setCart(updatedCart)
      // Clear cart token when clearing cart
      cartService.clearCartToken()
    } catch (error) {
      console.error('Failed to clear cart:', error)
      addToast(error instanceof Error ? error.message : 'Failed to clear cart', 'error')
      throw error
    }
  }
  
  const isInCart = (productId: string): boolean => {
    return cart?.cart_items?.some(item => item.product?.id === productId) || false
  }
  
  const getCartItem = (productId: string) => {
    return cart?.cart_items?.find(item => item.product?.id === productId)
  }
  
  const contextValue: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem,
    refreshCart
  }
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}