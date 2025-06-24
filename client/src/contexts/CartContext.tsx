import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { LocalCart, LocalCartItem, CartContextType } from '@/types/cart'
import { Product } from '@/types/api-generated'

const CART_STORAGE_KEY = 'indieout_cart'

// Initial cart state
const initialCart: LocalCart = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  updatedAt: new Date()
}

// Cart actions
type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { itemId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: LocalCart }

// Cart reducer
function cartReducer(state: LocalCart, action: CartAction): LocalCart {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity } = action.payload
      const existingItem = state.items.find(item => item.product.id === product.id)
      
      let newItems: LocalCartItem[]
      
      if (existingItem) {
        // Update existing item quantity
        newItems = state.items.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        const newItem: LocalCartItem = {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          addedAt: new Date()
        }
        newItems = [...state.items, newItem]
      }
      
      return calculateCartTotals({ ...state, items: newItems, updatedAt: new Date() })
    }
    
    case 'REMOVE_FROM_CART': {
      const newItems = state.items.filter(item => item.id !== action.payload.itemId)
      return calculateCartTotals({ ...state, items: newItems, updatedAt: new Date() })
    }
    
    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item.id !== itemId)
        return calculateCartTotals({ ...state, items: newItems, updatedAt: new Date() })
      }
      
      const newItems = state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
      
      return calculateCartTotals({ ...state, items: newItems, updatedAt: new Date() })
    }
    
    case 'CLEAR_CART':
      return { ...initialCart, updatedAt: new Date() }
    
    case 'LOAD_CART':
      return action.payload
    
    default:
      return state
  }
}

// Helper function to calculate cart totals
function calculateCartTotals(cart: LocalCart): LocalCart {
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.items.reduce((sum, item) => sum + (Number(item.product.base_price) * item.quantity), 0)
  
  return {
    ...cart,
    totalItems,
    totalPrice
  }
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Cart provider component
interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, initialCart)
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY)
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        // Convert date strings back to Date objects
        parsedCart.updatedAt = new Date(parsedCart.updatedAt)
        parsedCart.items = parsedCart.items.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }))
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error)
    }
  }, [])
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error)
    }
  }, [cart])
  
  const addToCart = (product: Product, quantity: number = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } })
  }
  
  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId } })
  }
  
  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } })
  }
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }
  
  const isInCart = (productId: string): boolean => {
    return cart.items.some(item => item.product.id === productId)
  }
  
  const getCartItem = (productId: string): LocalCartItem | undefined => {
    return cart.items.find(item => item.product.id === productId)
  }
  
  const contextValue: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getCartItem
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