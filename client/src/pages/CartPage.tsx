import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/hooks/useAuth'

export default function CartPage() {
  const { cart, loading, updateQuantity, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isClearing, setIsClearing] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await updateQuantity(itemId, newQuantity)
    } catch (error) {
      // Error is already handled in context
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId)
    } catch (error) {
      // Error is already handled in context
    }
  }

  const handleClearCart = async () => {
    setIsClearing(true)
    try {
      await clearCart()
    } catch (error) {
      // Error is already handled in context
    } finally {
      setIsClearing(false)
    }
  }

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout')
    } else {
      setShowCheckoutModal(true)
    }
  }

  const handleContinueAsGuest = () => {
    setShowCheckoutModal(false)
    navigate('/checkout')
  }

  const handleSignIn = () => {
    setShowCheckoutModal(false)
    navigate('/login', { state: { returnTo: '/checkout' } })
  }

  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return '/placeholder-product.svg'
    }
    return imageUrl
  }

  const subtotal = parseFloat(cart?.total_price?.toString() || '0')
  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + shipping + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
            <p className="text-charcoal-600">Loading cart...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.cart_items?.length === 0) {
    return (
      <div className="min-h-screen bg-sand-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-24 w-24 text-charcoal-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m6.5-6h3" />
              </svg>
              <h1 className="text-3xl font-bold text-charcoal-900 mb-4">Your cart is empty</h1>
              <p className="text-lg text-charcoal-600 mb-8">
                Discover amazing gear from independent outdoor brands
              </p>
              <Link
                to="/shop"
                className="bg-forest-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            disabled={isClearing}
            className="text-sm text-charcoal-500 hover:text-charcoal-700 transition-colors flex items-center space-x-1"
          >
            {isClearing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-charcoal-400 border-b-transparent"></div>
                <span>Clearing...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear cart</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-card overflow-hidden">
              <div className="p-6 border-b border-sand-200">
                <h2 className="text-lg font-semibold text-charcoal-900">
                  Items ({cart?.total_items || 0})
                </h2>
              </div>
              
              <div className="divide-y divide-sand-200">
                {cart?.cart_items?.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={getImageSrc(item.product.images?.[0])}
                          alt={item.product.name}
                          className="w-20 h-20 rounded-lg object-cover border border-sand-200"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              to={`/shop/products/${item.product.slug || item.product.id}`}
                              className="font-semibold text-charcoal-900 hover:text-forest-600 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            
                            {item.product.store && (
                              <p className="text-sm text-charcoal-600 mt-1">
                                Sold by{' '}
                                <Link
                                  to={`/shop/stores/${item.product.store.slug}`}
                                  className="text-forest-600 hover:text-forest-700"
                                >
                                  {item.product.store.name}
                                </Link>
                              </p>
                            )}
                            
                            {/* Stock Status Warning */}
                            {item.product.track_inventory && (
                              <>
                                {item.product.out_of_stock ? (
                                  <div className="flex items-center text-sm text-red-600 mt-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Out of stock - Remove from cart
                                  </div>
                                ) : item.product.low_stock ? (
                                  <div className="flex items-center text-sm text-amber-600 mt-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Only {item.product.total_inventory} left in stock
                                  </div>
                                ) : item.quantity > item.product.total_inventory ? (
                                  <div className="flex items-center text-sm text-red-600 mt-2">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    Requested quantity ({item.quantity}) exceeds available stock ({item.product.total_inventory})
                                  </div>
                                ) : null}
                              </>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-3">
                              {/* Quantity Controls */}
                              <div className="flex items-center border border-charcoal-300 rounded-lg">
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  className="p-2 hover:bg-sand-50 transition-colors rounded-l-lg"
                                  disabled={item.quantity <= 1}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                <span className="px-4 py-2 text-sm font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="p-2 hover:bg-sand-50 transition-colors rounded-r-lg"
                                  disabled={item.quantity >= item.product.total_inventory || item.product.out_of_stock}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-sm text-charcoal-500 hover:text-clay-600 transition-colors flex items-center space-x-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="font-semibold text-lg text-charcoal-900">
                              ${(Number(item.product.base_price) * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-sm text-charcoal-500">
                              ${Number(item.product.base_price).toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                to="/shop"
                className="text-forest-600 hover:text-forest-700 font-medium flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-forest-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                {subtotal < 100 && (
                  <div className="bg-sand-50 rounded-lg p-3">
                    <p className="text-sm text-charcoal-600">
                      Add <span className="font-semibold">${(100 - subtotal).toFixed(2)}</span> more for free shipping!
                    </p>
                  </div>
                )}
                
                <div className="border-t border-sand-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-charcoal-900">Total</span>
                    <span className="text-lg font-bold text-charcoal-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                className="w-full bg-forest-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-forest-700 transition-colors mt-6 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Proceed to Checkout</span>
              </button>
              
              {!isAuthenticated && (
                <p className="text-xs text-charcoal-500 mt-3 text-center">
                  Continue as guest or sign in during checkout
                </p>
              )}
              
              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-sand-200">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center text-charcoal-600">
                    <svg className="w-4 h-4 mr-2 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center text-charcoal-600">
                    <svg className="w-4 h-4 mr-2 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>30-day returns</span>
                  </div>
                  <div className="flex items-center text-charcoal-600">
                    <svg className="w-4 h-4 mr-2 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 11-9.75 9.75 9.75-9.75 0 019.75-9.75z" />
                    </svg>
                    <span>Expert support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal content */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Go to checkout</h2>
              
              {/* Continue as guest button */}
              <button
                onClick={handleContinueAsGuest}
                className="w-full bg-white border-2 border-charcoal-900 text-charcoal-900 py-3 px-6 rounded-full font-semibold hover:bg-charcoal-50 transition-colors mb-4"
              >
                Continue as a guest
              </button>
              
              <div className="text-sm text-charcoal-500 mb-4">OR</div>
              
              {/* Sign in section */}
              <div className="text-left mb-6">
                <h3 className="font-semibold text-charcoal-900 mb-4">Sign in or register</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleSignIn}
                    className="w-full bg-charcoal-900 text-white py-3 px-6 rounded-full font-semibold hover:bg-charcoal-800 transition-colors"
                  >
                    Sign in with email
                  </button>
                  
                  <button
                    disabled
                    className="w-full border border-charcoal-300 text-charcoal-400 py-3 px-6 rounded-full font-semibold opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>🔍</span>
                    <span>Continue with Google</span>
                  </button>
                  
                  <button
                    disabled
                    className="w-full border border-charcoal-300 text-charcoal-400 py-3 px-6 rounded-full font-semibold opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>📘</span>
                    <span>Continue with Facebook</span>
                  </button>
                  
                  <button
                    disabled
                    className="w-full border border-charcoal-300 text-charcoal-400 py-3 px-6 rounded-full font-semibold opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <span>🍎</span>
                    <span>Continue with Apple</span>
                  </button>
                </div>
              </div>
              
              <p className="text-xs text-charcoal-500">
                By clicking Continue or Continue with Google, Facebook, or Apple, you agree to IndieOut's{' '}
                <a href="/terms" className="text-forest-600 hover:underline">Terms of Use</a> and{' '}
                <a href="/privacy" className="text-forest-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}