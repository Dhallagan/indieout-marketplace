import { useEffect, useState } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { orderService } from '@/services/orderService'
import { CheckCircleIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'
import { Order } from '@/types/api-generated'

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      let orderData
      
      if (isAuthenticated) {
        // Authenticated user - fetch order from API
        orderData = await orderService.getOrder(orderId!)
      } else {
        // Guest user - use order number from URL params
        const orderNumber = searchParams.get('order_number')
        const email = searchParams.get('email')
        
        if (orderNumber) {
          orderData = await orderService.getOrderByNumber(orderNumber, email || undefined)
        } else {
          console.error('No order number provided for guest checkout')
        }
      }
      
      if (orderData) {
        setOrder(orderData)
      }
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircleIcon className="h-16 w-16 text-forest-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-lg text-charcoal-600">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
        </div>

        {order && (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-forest-600 text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <p className="text-sm opacity-90">Order Number: {order.order_number}</p>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 bg-sand-50 rounded-lg">
                      <img
                        src={item.product_snapshot?.images?.[0] || '/placeholder-product.svg'}
                        alt={item.product_snapshot?.name || 'Product'}
                        className="w-20 h-20 object-cover rounded-lg border border-sand-200"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal-900">
                          {item.product_snapshot?.name || 'Product'}
                        </h4>
                        <p className="text-sm text-charcoal-600">
                          SKU: {item.product_snapshot?.sku}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal-900">
                          ${(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          ${parseFloat(item.unit_price).toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="mt-6 pt-6 border-t border-sand-200">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-600">Subtotal</span>
                      <span className="font-medium">${parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-600">Shipping</span>
                      <span className="font-medium">
                        {parseFloat(order.shipping_cost) === 0 ? 'FREE' : `$${parseFloat(order.shipping_cost).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-charcoal-600">Tax</span>
                      <span className="font-medium">${parseFloat(order.tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-sand-200">
                      <span className="text-lg font-semibold text-charcoal-900">Total</span>
                      <span className="text-lg font-semibold text-charcoal-900">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <TruckIcon className="h-6 w-6 text-forest-600 mr-2" />
                <h3 className="text-lg font-semibold text-charcoal-900">Shipping Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-charcoal-700 mb-2">Shipping Address</h4>
                  <div className="text-sm text-charcoal-600">
                    <p>{order.shipping_address?.firstName} {order.shipping_address?.lastName}</p>
                    <p>{order.shipping_address?.address1}</p>
                    {order.shipping_address?.address2 && <p>{order.shipping_address.address2}</p>}
                    <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}</p>
                    <p>{order.shipping_address?.country}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-charcoal-700 mb-2">Contact Information</h4>
                  <div className="text-sm text-charcoal-600">
                    <p>Email: {order.shipping_address?.email || order.user?.email}</p>
                    {order.shipping_address?.phone && <p>Phone: {order.shipping_address.phone}</p>}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-sand-50 rounded-lg">
                <p className="text-sm text-charcoal-600">
                  <span className="font-medium">Order Status:</span> {order.status}
                </p>
                <p className="text-sm text-charcoal-600 mt-1">
                  Estimated delivery: 5-7 business days
                </p>
              </div>
            </div>

            {/* Store Information */}
            {order.store && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <MapPinIcon className="h-6 w-6 text-forest-600 mr-2" />
                  <h3 className="text-lg font-semibold text-charcoal-900">Sold by {order.store.name}</h3>
                </div>
                <p className="text-sm text-charcoal-600">
                  This order will be fulfilled by {order.store.name}. You'll receive tracking information once your order ships.
                </p>
              </div>
            )}

            {/* Guest Order Info */}
            {!isAuthenticated && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Save Your Order Information</h4>
                    <p className="text-sm text-blue-800 mb-2">
                      Since you checked out as a guest, save these details to track your order:
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Order Number:</strong> {order.order_number}</li>
                      <li>• <strong>Email:</strong> {order.shipping_address?.email || order.user?.email}</li>
                    </ul>
                    <p className="text-sm text-blue-800 mt-3">
                      You can use these details to track your order status anytime.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">What's Next?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-sm font-bold text-forest-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">Order Confirmation Email</p>
                    <p className="text-sm text-charcoal-600">You'll receive an email confirmation with your order details and receipt within the next few minutes.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-sm font-bold text-forest-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">Processing & Packaging</p>
                    <p className="text-sm text-charcoal-600">Your items will be carefully packaged by our independent sellers and shipped within 2-3 business days.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-sm font-bold text-forest-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">Shipping & Tracking</p>
                    <p className="text-sm text-charcoal-600">Once shipped, you'll receive tracking information to monitor your delivery progress.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <Link
                to="/shop"
                className="inline-block bg-forest-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors"
              >
                Continue Shopping
              </Link>
              
              {isAuthenticated && (
                <Link
                  to="/account/orders"
                  className="block text-forest-600 hover:text-forest-700 font-medium"
                >
                  View All Orders
                </Link>
              )}
              
              <p className="text-sm text-charcoal-600">
                A confirmation email has been sent to {order.shipping_address?.email || order.user?.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}