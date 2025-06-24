import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { orderService } from '@/services/orderService'
import { guestOrderService } from '@/services/guestOrderService'

export default function CheckoutSuccessPage() {
  const location = useLocation()
  const { orderId } = useParams<{ orderId: string }>()
  const { isGuest } = location.state || {}
  
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('No order ID provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const orderData = await orderService.getOrder(orderId)
        setOrder(orderData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
            <p className="text-charcoal-600">Loading your order details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sand-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-card p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Unable to Load Order</h1>
            <p className="text-charcoal-600 mb-8">{error}</p>
            <Link to="/shop" className="bg-forest-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-card p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-forest-100 mb-6">
            <svg className="h-8 w-8 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-charcoal-900 mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-charcoal-600 mb-8">
            Thank you for your purchase. Your order has been successfully placed and you'll receive a confirmation email shortly.
          </p>

          {/* Order Details */}
          {order && (
            <div className="bg-sand-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm font-medium text-charcoal-700 mb-1">Order Number</p>
                  <p className="text-lg font-semibold text-charcoal-900">{order.order_number}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-charcoal-700 mb-1">Total Amount</p>
                  <p className="text-lg font-semibold text-charcoal-900">${order.total_amount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          {order && order.order_items && order.order_items.length > 0 && (
            <div className="bg-white border border-sand-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Order Items</h3>
              
              {order.store && (
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
                    </svg>
                  </div>
                  <span className="font-medium text-charcoal-900">From {order.store.name}</span>
                </div>
              )}
              
              <div className="space-y-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-3 bg-sand-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product_image || item.product?.images?.[0] || '/placeholder-product.svg'}
                        alt={item.product_name || item.product?.name}
                        className="w-16 h-16 rounded-lg object-cover border border-sand-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-charcoal-900">{item.product_name || item.product?.name}</h4>
                      {item.product?.sku && (
                        <p className="text-sm text-charcoal-500">SKU: {item.product.sku}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-charcoal-600">Qty: {item.quantity}</span>
                        <span className="font-semibold text-charcoal-900">${item.total_price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white border border-sand-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-4">What's Next?</h3>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-forest-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Order Confirmation</p>
                  <p className="text-sm text-charcoal-600">You'll receive an email confirmation with your order details within the next few minutes.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-forest-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Processing & Shipping</p>
                  <p className="text-sm text-charcoal-600">Your items will be carefully packaged by our sellers and shipped within 2-3 business days.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-forest-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Tracking Information</p>
                  <p className="text-sm text-charcoal-600">Once shipped, you'll receive tracking information to monitor your delivery.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Checkout Info */}
          {isGuest && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Guest Order Information</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Since you checked out as a guest, you can track your order using:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Order Number:</strong> {order?.order_number}</li>
                    <li>• <strong>Email Address:</strong> The email you provided during checkout</li>
                  </ul>
                  <p className="text-sm text-blue-800 mt-3">
                    <Link to="/track-order" className="font-medium underline hover:no-underline">
                      Use our order tracking page
                    </Link> to check your order status anytime.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-forest-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Continue Shopping</span>
            </Link>
            
            {isGuest ? (
              <Link
                to="/track-order"
                className="border-2 border-forest-600 text-forest-600 px-8 py-3 rounded-lg font-semibold hover:bg-forest-50 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-6.72" />
                </svg>
                <span>Track Your Order</span>
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="border-2 border-forest-600 text-forest-600 px-8 py-3 rounded-lg font-semibold hover:bg-forest-50 transition-colors inline-flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>View Orders</span>
              </Link>
            )}
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-sand-200">
            <h4 className="font-semibold text-charcoal-900 mb-4">Need Help?</h4>
            <p className="text-sm text-charcoal-600 mb-4">
              If you have any questions about your order, don't hesitate to reach out to our support team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:support@indieout.com"
                className="text-forest-600 hover:text-forest-700 font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@indieout.com</span>
              </a>
              
              <a
                href="tel:+1-555-0123"
                className="text-forest-600 hover:text-forest-700 font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>1-555-0123</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}