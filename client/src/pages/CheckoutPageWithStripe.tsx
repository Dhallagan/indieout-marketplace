import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/hooks/useAuth'
import { addressService } from '@/services/addressService'
import { orderService } from '@/services/orderService'
import { createPaymentIntent, confirmPayment } from '@/services/paymentService'
import { useToast } from '@/contexts/ToastContext'
import { Address } from '@/types/api-generated'
import StripeProvider from '@/components/StripeProvider'
import StripePaymentForm from '@/components/StripePaymentForm'

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

export default function CheckoutPageWithStripe() {
  const { cart, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState<'shipping' | 'payment'>('shipping')
  const [isProcessing, setIsProcessing] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [paymentClientSecret, setPaymentClientSecret] = useState<string | null>(null)
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (!cart || cart.cart_items.length === 0) {
      navigate('/cart')
    }
  }, [cart, navigate])

  // Load user's addresses
  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses()
    }
  }, [isAuthenticated])

  const loadAddresses = async () => {
    try {
      const addresses = await addressService.getAddresses()
      setSavedAddresses(addresses)
      
      const defaultAddr = addresses.find(addr => addr.is_default)
      if (defaultAddr) {
        setDefaultAddress(defaultAddr)
        setSelectedAddressId(defaultAddr.id)
        
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

  const subtotal = parseFloat(cart?.total_price?.toString() || '0')
  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!shippingAddress.firstName || !shippingAddress.lastName || !shippingAddress.email ||
        !shippingAddress.address1 || !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zipCode) {
      addToast('Please fill in all required fields', 'error')
      return
    }

    setIsProcessing(true)

    try {
      let orders
      let createdOrder

      // Prepare order data
      const orderData: any = {
        payment_method: 'card',
        shipping_address: shippingAddress,
        billing_address: shippingAddress
      }

      // Add guest-specific fields if not authenticated
      if (!isAuthenticated) {
        orderData.email = shippingAddress.email
        orderData.cart_items = cart.cart_items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        }))
      }

      // Create order (works for both authenticated and guest users)
      orders = await orderService.createOrder(orderData)
      createdOrder = orders[0]

      setOrder(createdOrder)

      // Create payment intent
      const paymentData = await createPaymentIntent(createdOrder.id)
      setPaymentClientSecret(paymentData.client_secret)
      
      // Move to payment step
      setCurrentStep('payment')
    } catch (error) {
      console.error('Order creation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order'
      addToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentSuccess = async () => {
    if (!order) return

    try {
      // Clear cart
      clearCart()
      
      if (isAuthenticated) {
        // Authenticated user - simple redirect
        navigate(`/order-confirmation/${order.id}`)
      } else {
        // Guest user - redirect with order number
        navigate(`/order-confirmation/${order.id}?order_number=${order.order_number}&email=${encodeURIComponent(shippingAddress.email)}`)
      }
    } catch (error) {
      console.error('Navigation failed:', error)
      addToast('Payment processing failed. Please contact support.', 'error')
    }
  }

  const handlePaymentError = (error: string) => {
    addToast(error, 'error')
  }

  if (!cart || cart.cart_items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-sand-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="mt-6 flex items-center space-x-4">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep === 'shipping' 
                  ? 'bg-forest-600 border-forest-600 text-white' 
                  : 'bg-white border-forest-600 text-forest-600'
              }`}>
                <span className="text-sm font-medium">1</span>
              </div>
              <span className="ml-2 text-sm font-medium text-charcoal-900">
                Shipping
              </span>
            </div>
            
            <div className="flex-1 h-0.5 bg-sand-200"></div>
            
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                currentStep === 'payment' 
                  ? 'bg-forest-600 border-forest-600 text-white' 
                  : 'bg-white border-sand-300 text-sand-400'
              }`}>
                <span className="text-sm font-medium">2</span>
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep === 'payment' ? 'text-charcoal-900' : 'text-sand-400'
              }`}>
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'shipping' ? (
              <form onSubmit={handleShippingSubmit} className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-card p-6">
                  <h2 className="text-lg font-semibold text-charcoal-900 mb-6">
                    Shipping Information
                  </h2>

                  {/* Address form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.firstName}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
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
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={shippingAddress.email}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.address1}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        Apartment, suite, etc.
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address2}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
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
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
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
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-3 py-2 border border-sand-300 rounded-md focus:ring-2 focus:ring-forest-500 focus:border-forest-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                    isProcessing
                      ? 'bg-charcoal-300 text-charcoal-500 cursor-not-allowed'
                      : 'bg-forest-600 text-white hover:bg-forest-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment'}
                </button>
              </form>
            ) : (
              <StripeProvider clientSecret={paymentClientSecret || undefined}>
                <StripePaymentForm
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  disabled={isProcessing}
                />
              </StripeProvider>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {cart.cart_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0] || '/placeholder-product.svg'}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal-900">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-charcoal-600">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-charcoal-900">
                      ${(item.product.base_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-sand-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-charcoal-600">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-sand-200 pt-2 flex justify-between">
                  <span className="text-lg font-semibold text-charcoal-900">Total</span>
                  <span className="text-lg font-semibold text-charcoal-900">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}