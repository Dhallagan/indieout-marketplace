import { useState } from 'react'
import { Link } from 'react-router-dom'
import { guestOrderService } from '@/services/guestOrderService'
import { Order } from '@/types/api-generated'

export default function GuestOrderTrackingPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setOrder(null)

    try {
      const orderData = await guestOrderService.trackGuestOrder({
        order_number: orderNumber,
        email: email
      })
      setOrder(orderData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find order')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'confirmed': return 'text-blue-600 bg-blue-100'
      case 'processing': return 'text-purple-600 bg-purple-100'
      case 'shipped': return 'text-green-600 bg-green-100'
      case 'delivered': return 'text-green-700 bg-green-200'
      case 'cancelled': return 'text-red-600 bg-red-100'
      default: return 'text-charcoal-600 bg-charcoal-100'
    }
  }

  return (
    <div className="min-h-screen bg-sand-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-4">Track Your Order</h1>
          <p className="text-lg text-charcoal-600">
            Enter your order number and email to view your order status
          </p>
        </div>

        {!order && (
          <div className="bg-white rounded-lg shadow-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Order Number
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="ORD-20240624-ABC123"
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-forest-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-forest-700 disabled:bg-charcoal-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <span>Track Order</span>
                )}
              </button>
            </form>
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-charcoal-900">Order {order.order_number}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-charcoal-600">Order Date:</span>
                  <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-charcoal-600">Total:</span>
                  <p className="font-medium">${order.total_amount.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-charcoal-600">Items:</span>
                  <p className="font-medium">{order.total_items}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-sand-200 rounded-lg">
                    <img
                      src={item.product_image || '/placeholder-product.svg'}
                      alt={item.product_name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal-900">{item.product_name}</h4>
                      <p className="text-sm text-charcoal-600">Quantity: {item.quantity}</p>
                      <p className="text-sm text-charcoal-600">
                        ${Number(item.unit_price).toFixed(2)} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${Number(item.total_price).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-card p-6">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Shipping Address</h3>
              <div className="text-sm text-charcoal-700 space-y-1">
                <p>{order.shipping_address.firstName} {order.shipping_address.lastName}</p>
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setOrder(null)}
                className="text-forest-600 hover:text-forest-700 font-medium"
              >
                Track Another Order
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/shop"
            className="text-forest-600 hover:text-forest-700 font-medium"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}