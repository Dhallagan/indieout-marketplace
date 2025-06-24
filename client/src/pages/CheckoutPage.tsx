import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { guestOrderService } from '@/services/guestOrderService'
import { addressService } from '@/services/addressService'
import { orderService } from '@/services/orderService'
import { useToast } from '@/contexts/ToastContext'
import { Address } from '@/types/api-generated'

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface PaymentInfo {
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGuestCheckout, setIsGuestCheckout] = useState(false)
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
  const [showAddressSelector, setShowAddressSelector] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })
  
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
      navigate('/cart')
    }
  }, [cart, navigate])

  // Initialize guest checkout if not authenticated, or load addresses if authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsGuestCheckout(true)
    } else {
      loadUserAddresses()
    }
  }, [isAuthenticated])

  const loadUserAddresses = async () => {
    try {
      const addresses = await addressService.getAddresses()
      setSavedAddresses(addresses)
      
      // Find default address
      const defaultAddr = addresses.find(addr => addr.is_default)
      if (defaultAddr) {
        setDefaultAddress(defaultAddr)
        setSelectedAddressId(defaultAddr.id)
        
        // Pre-fill shipping form with default address
        setShippingAddress({
          firstName: defaultAddr.full_name.split(' ')[0] || '',
          lastName: defaultAddr.full_name.split(' ').slice(1).join(' ') || '',
          email: user?.email || '',
          phone: defaultAddr.phone || '',
          address1: defaultAddr.address_line_1,
          address2: defaultAddr.address_line_2 || '',
          city: defaultAddr.city,
          state: defaultAddr.state,
          zipCode: defaultAddr.zip_code,
          country: defaultAddr.country
        })
      }
    } catch (error) {
      console.error('Failed to load addresses:', error)
    }
  }

  const handleAddressSelection = (address: Address) => {
    setSelectedAddressId(address.id)
    setDefaultAddress(address)
    
    // Update shipping form
    setShippingAddress({
      firstName: address.full_name.split(' ')[0] || '',
      lastName: address.full_name.split(' ').slice(1).join(' ') || '',
      email: user?.email || '',
      phone: address.phone || '',
      address1: address.address_line_1,
      address2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zip_code,
      country: address.country
    })
    
    setShowAddressSelector(false)
  }

  const subtotal = parseFloat(cart?.total_price?.toString() || '0')
  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(2)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    try {
      if (isGuestCheckout) {
        // Guest checkout flow
        const guestOrderData = {
          email: shippingAddress.email,
          shipping_address: shippingAddress,
          billing_address: shippingAddress, // Use shipping as billing for now
          payment_method: 'card', // TODO: Get from payment form
          cart_items: guestOrderService.convertCartItems(cart.cart_items)
        }

        const orders = await guestOrderService.createGuestOrder(guestOrderData)
        
        // Clear cart and redirect to success
        clearCart()
        navigate(`/checkout/success/${orders[0]?.id}`, { 
          state: { 
            isGuest: true
          } 
        })
      } else {
        // Authenticated user flow - backend will use their default address
        const orderData = {
          payment_method: 'card'
        }

        const orders = await orderService.createOrder(orderData)
        
        // Clear cart and redirect to success
        clearCart()
        navigate(`/checkout/success/${orders[0]?.id}`, { 
          state: { 
            isGuest: false
          } 
        })
      }
    } catch (error) {
      console.error('Order creation failed:', error)
      addToast(error instanceof Error ? error.message : 'Failed to create order. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return '/placeholder-product.svg'
    }
    return imageUrl
  }

  if (cart.cart_items.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-sand-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-charcoal-900">Checkout</h1>
            
            {isGuestCheckout && (
              <div className="text-right">
                <p className="text-sm text-charcoal-600 mb-2">Checking out as guest</p>
                <button
                  onClick={() => navigate('/login', { state: { returnTo: '/checkout' } })}
                  className="text-sm text-forest-600 hover:text-forest-700 font-medium"
                >
                  Have an account? Sign in
                </button>
              </div>
            )}
          </div>
          
          {/* Simple checkout indicator */}
          <div className="mt-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-forest-600 border-2 border-forest-600 text-white">
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="ml-2 text-sm font-medium text-charcoal-900">
                Complete Your Order
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Contact, Shipping & Payment Information */}
            <div className="space-y-6">
                {/* Authenticated User Address Display (Amazon Style) */}
                {isAuthenticated && defaultAddress && (
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h2 className="text-lg font-semibold text-charcoal-900">
                            Delivering to {defaultAddress.full_name}
                          </h2>
                          {defaultAddress.is_default && (
                            <span className="bg-forest-100 text-forest-800 text-xs font-medium px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-charcoal-600 text-sm leading-relaxed">
                          {defaultAddress.formatted_address}
                        </p>
                        {defaultAddress.phone && (
                          <p className="text-charcoal-600 text-sm mt-1">{defaultAddress.phone}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowAddressSelector(true)}
                        className="text-forest-600 hover:text-forest-700 text-sm font-medium border border-forest-300 hover:border-forest-400 px-4 py-2 rounded-lg transition-colors"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Address Selector Modal */}
                {showAddressSelector && (
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-charcoal-900">Choose a delivery address</h2>
                      <button
                        onClick={() => setShowAddressSelector(false)}
                        className="text-charcoal-400 hover:text-charcoal-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {savedAddresses.map((address) => (
                        <div
                          key={address.id}
                          onClick={() => handleAddressSelection(address)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedAddressId === address.id 
                              ? 'border-forest-500 bg-forest-50' 
                              : 'border-charcoal-200 hover:border-forest-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-charcoal-800">{address.full_name}</p>
                                {address.is_default && (
                                  <span className="bg-forest-100 text-forest-800 text-xs font-medium px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-charcoal-600 text-sm leading-relaxed">
                                {address.formatted_address}
                              </p>
                              {address.phone && (
                                <p className="text-charcoal-600 text-sm mt-1">{address.phone}</p>
                              )}
                            </div>
                            {selectedAddressId === address.id && (
                              <div className="ml-3">
                                <div className="w-5 h-5 bg-forest-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      <div 
                        onClick={() => {
                          setShowAddressSelector(false)
                          // TODO: Add navigation to add new address
                        }}
                        className="p-4 border-2 border-dashed border-charcoal-300 rounded-lg cursor-pointer hover:border-forest-400 transition-colors text-center"
                      >
                        <div className="flex items-center justify-center space-x-2 text-charcoal-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="font-medium">Add a new address</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Express Checkout Options */}
                {isGuestCheckout && (
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-4">Express Checkout</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <span>🅿️</span>
                        <span>PayPal</span>
                      </button>
                      <button className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <span>🍎</span>
                        <span>Apple Pay</span>
                      </button>
                    </div>
                    <div className="text-center text-sm text-charcoal-500 my-4">— OR —</div>
                  </div>
                )}

                {/* Contact Information - Only show for guest checkout */}
                {isGuestCheckout && (
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-charcoal-900">Contact Information</h2>
                      <button
                        type="button"
                        onClick={() => navigate('/login', { state: { returnTo: '/checkout' } })}
                        className="text-sm text-forest-600 hover:text-forest-700 font-medium"
                      >
                        Sign in for faster checkout
                      </button>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                        placeholder="Enter your email for order updates"
                        className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                      />
                      <p className="text-xs text-charcoal-500 mt-1">We'll send order confirmations and updates to this email</p>
                    </div>
                  </div>
                )}

                {/* Shipping Information - Only show for guest checkout */}
                {isGuestCheckout && (
                  <div className="bg-white rounded-lg shadow-card p-6">
                    <h2 className="text-lg font-semibold text-charcoal-900 mb-6">Shipping Address</h2>
                    
                    <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress({...shippingAddress, address1: e.target.value})}
                        className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Apartment, suite, etc. (optional)
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress({...shippingAddress, address2: e.target.value})}
                        className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                          className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                          className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-charcoal-700 mb-1">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          required
                          value={shippingAddress.zipCode}
                          onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                          className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                        />
                      </div>
                    </div>
                    
                    </div>
                  </div>
                )}


                {/* Payment Information */}
                <div className="bg-white rounded-lg shadow-card p-6">
                <h2 className="text-xl font-semibold text-charcoal-900 mb-6">Payment</h2>
                
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="bg-sand-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center text-sm text-charcoal-600">
                      <svg className="w-4 h-4 mr-2 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>This is a demo checkout. No real payment will be processed.</span>
                    </div>
                  </div>

                  {/* Payment Method Header */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-charcoal-900 flex items-center">
                      <span className="mr-2">💳</span>
                      Credit Card
                    </h3>
                    <div className="flex space-x-2 mt-2">
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">VISA</span>
                      <span className="text-xs bg-red-100 px-2 py-1 rounded">MC</span>
                      <span className="text-xs bg-blue-100 px-2 py-1 rounded">AMEX</span>
                      <span className="text-xs bg-purple-100 px-2 py-1 rounded">DISC</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="4242 4242 4242 4242"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Name on Card *
                    </label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.nameOnCard}
                      onChange={(e) => setPaymentInfo({...paymentInfo, nameOnCard: e.target.value})}
                      className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                        className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        CVV *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                        className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                      />
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="pt-6 border-t border-sand-200">
                    <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Billing Address</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center p-4 border-2 border-forest-500 bg-forest-50 rounded-lg">
                        <input
                          type="radio"
                          name="billingAddress"
                          value="same"
                          defaultChecked
                          className="w-4 h-4 text-forest-600 focus:ring-forest-500"
                        />
                        <span className="ml-3 font-medium text-charcoal-900">Same as shipping address</span>
                      </div>
                      
                      <div className="flex items-center p-4 border border-charcoal-200 rounded-lg hover:border-forest-400 cursor-pointer transition-colors opacity-60">
                        <input
                          type="radio"
                          name="billingAddress"
                          value="different"
                          disabled
                          className="w-4 h-4 text-forest-600 focus:ring-forest-500"
                        />
                        <span className="ml-3 font-medium text-charcoal-900">Use different billing address</span>
                        <span className="ml-auto text-xs text-charcoal-500">Coming Soon</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Payment Method */}
                  <div className="pt-4 border-t border-sand-200">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-forest-600 border-charcoal-300 rounded focus:ring-forest-500"
                      />
                      <span className="text-sm text-charcoal-700">Save payment method for future orders</span>
                    </label>
                    <p className="text-xs text-charcoal-500 mt-1 ml-6">
                      {isGuestCheckout ? 'Create an account to save payment methods' : 'Your payment information will be securely stored'}
                    </p>
                  </div>
                  
                  <div className="flex justify-end pt-6">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="bg-forest-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-forest-700 disabled:bg-charcoal-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 text-lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent"></div>
                          <span>Processing Order...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span>Complete Order - ${total.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
                </div>
              </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.cart_items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <img
                      src={getImageSrc(item.product.images?.[0])}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-sand-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-charcoal-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-charcoal-900">
                      ${(Number(item.product.base_price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 pt-4 border-t border-sand-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-600">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-forest-600">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-charcoal-600">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-sand-200">
                  <span className="font-semibold text-charcoal-900">Total</span>
                  <span className="font-bold text-lg text-charcoal-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}