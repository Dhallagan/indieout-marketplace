import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sellerOrderService, UpdateOrderStatusRequest } from '@/services/sellerOrderService'
import { Order } from '@/types/api-generated'
import { useToast } from '@/contexts/ToastContext'
import SellerLayout from '@/components/seller/SellerLayout'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
  const { addToast } = useToast()

  useEffect(() => {
    loadOrders()
  }, [statusFilter, searchTerm])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const params = {
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      }
      const data = await sellerOrderService.getStoreOrders(params)
      setOrders(data)
    } catch (error) {
      console.error('Failed to load orders:', error)
      addToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, data: UpdateOrderStatusRequest) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId))
      const updatedOrder = await sellerOrderService.updateOrderStatus(orderId, data)
      
      // Update the order in the list
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ))
      
      addToast('Order status updated successfully', 'success')
    } catch (error) {
      console.error('Failed to update order status:', error)
      addToast(error instanceof Error ? error.message : 'Failed to update order status', 'error')
    } finally {
      setUpdatingOrders(prev => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-green-100 text-green-800'
      case 'delivered':
        return 'bg-forest-100 text-forest-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canUpdateStatus = (order: Order, newStatus: string) => {
    const currentStatus = order.status
    
    // Define allowed status transitions
    const transitions = {
      'pending': ['processing', 'cancelled'],
      'confirmed': ['processing', 'cancelled'], 
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered'],
      'delivered': [],
      'cancelled': [],
      'refunded': []
    }
    
    return transitions[currentStatus]?.includes(newStatus) || false
  }

  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return '/placeholder-product.svg'
    }
    return imageUrl
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal-900">Orders</h1>
            <p className="text-charcoal-600 mt-1">{orders.length} orders</p>
          </div>
          <button className="px-4 py-2 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors">
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-sand-200/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: orders.length },
                { key: 'pending', label: 'Unfulfilled', count: orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length },
                { key: 'processing', label: 'Processing', count: orders.filter(o => o.status === 'processing').length },
                { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'shipped').length },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center space-x-2 ${
                    statusFilter === tab.key
                      ? 'bg-forest-100 text-forest-800 border border-forest-200'
                      : 'text-charcoal-600 hover:bg-sand-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    statusFilter === tab.key
                      ? 'bg-forest-200 text-forest-800'
                      : 'bg-sand-200 text-charcoal-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-4 py-2 pl-10 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-sand-200/60 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
            <p className="text-charcoal-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-sand-200/60 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sand-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No orders found</h3>
            <p className="text-charcoal-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't received any orders yet. Keep promoting your products!"
                : `No orders with status "${statusFilter}" found.`
              }
            </p>
            <Link
              to="/seller/products"
              className="bg-forest-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-forest-700 transition-colors"
            >
              Manage Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand-25 border-b border-sand-200/60">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Order</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Date</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Customer</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Total</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Payment</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Fulfillment</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Items</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200/60">
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      onStatusUpdate={handleStatusUpdate}
                      isUpdating={updatingOrders.has(order.id)}
                      canUpdateStatus={canUpdateStatus}
                      getStatusColor={getStatusColor}
                      getImageSrc={getImageSrc}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  )
}

interface OrderRowProps {
  order: Order
  onStatusUpdate: (orderId: string, data: UpdateOrderStatusRequest) => void
  isUpdating: boolean
  canUpdateStatus: (order: Order, newStatus: string) => boolean
  getStatusColor: (status: string) => string
  getImageSrc: (imageUrl?: string) => string
}

function OrderRow({ 
  order, 
  onStatusUpdate, 
  isUpdating, 
  canUpdateStatus, 
  getStatusColor, 
  getImageSrc 
}: OrderRowProps) {
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'shipped') {
      setShowStatusModal(true)
    } else {
      onStatusUpdate(order.id, { status: newStatus as any })
    }
  }

  const handleShippedSubmit = () => {
    onStatusUpdate(order.id, { 
      status: 'shipped', 
      tracking_number: trackingNumber || undefined 
    })
    setShowStatusModal(false)
    setTrackingNumber('')
  }

  const getPaymentStatusBadge = () => {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-forest-100 to-forest-50 text-forest-800 border border-forest-200/60 shadow-sm">
        <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Paid
      </span>
    )
  }

  const getFulfillmentStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { 
        label: 'Unfulfilled', 
        className: 'bg-gradient-to-r from-clay-100 to-clay-50 text-clay-800 border border-clay-200/60',
        icon: (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'confirmed': { 
        label: 'Unfulfilled', 
        className: 'bg-gradient-to-r from-clay-100 to-clay-50 text-clay-800 border border-clay-200/60',
        icon: (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      },
      'processing': { 
        label: 'Processing', 
        className: 'bg-gradient-to-r from-sand-100 to-sand-50 text-charcoal-700 border border-sand-200/60',
        icon: (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      },
      'shipped': { 
        label: 'Shipped', 
        className: 'bg-gradient-to-r from-terra-100 to-terra-50 text-terra-800 border border-terra-200/60',
        icon: (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      },
      'delivered': { 
        label: 'Delivered', 
        className: 'bg-gradient-to-r from-forest-100 to-forest-50 text-forest-800 border border-forest-200/60',
        icon: (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      },
      'cancelled': { 
        label: 'Cancelled', 
        className: 'bg-gradient-to-r from-charcoal-100 to-charcoal-50 text-charcoal-700 border border-charcoal-200/60',
        icon: (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      }
    }[status] || { 
      label: status, 
      className: 'bg-gradient-to-r from-sand-100 to-sand-50 text-charcoal-700 border border-sand-200/60',
      icon: null
    }

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${statusConfig.className}`}>
        {statusConfig.icon}
        {statusConfig.label}
      </span>
    )
  }

  return (
    <>
      <tr className="hover:bg-sand-25 transition-colors">
        <td className="py-4 px-6">
          <div className="flex items-center space-x-3">
            <div className="text-sm">
              <div className="font-medium text-charcoal-900">#{order.order_number}</div>
            </div>
          </div>
        </td>
        
        <td className="py-4 px-6">
          <div className="text-sm text-charcoal-900">
            {new Date(order.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div className="text-xs text-charcoal-500">
            {new Date(order.created_at).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </td>
        
        <td className="py-4 px-6">
          <div className="text-sm">
            <div className="font-medium text-charcoal-900">
              {order.user?.first_name} {order.user?.last_name}
            </div>
            <div className="text-xs text-charcoal-500">{order.user?.email}</div>
          </div>
        </td>
        
        <td className="py-4 px-6">
          <div className="text-sm font-medium text-charcoal-900">
            ${parseFloat(order.total_amount).toFixed(2)}
          </div>
        </td>
        
        <td className="py-4 px-6">
          {getPaymentStatusBadge()}
        </td>
        
        <td className="py-4 px-6">
          {getFulfillmentStatusBadge(order.status)}
        </td>
        
        <td className="py-4 px-6">
          <button 
            onClick={() => setShowDetailsModal(true)}
            className="text-sm text-forest-600 hover:text-forest-700 font-medium"
          >
            {order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
          </button>
        </td>
        
        <td className="py-4 px-6 text-right">
          <div className="flex items-center justify-end space-x-2">
            {canUpdateStatus(order, 'processing') && (
              <button
                onClick={() => handleStatusChange('processing')}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Process
              </button>
            )}
            
            {canUpdateStatus(order, 'shipped') && (
              <button
                onClick={() => handleStatusChange('shipped')}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Ship
              </button>
            )}
            
            <button
              onClick={() => setShowDetailsModal(true)}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Order Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-sand-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-charcoal-900">Order #{order.order_number}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 text-charcoal-400 hover:text-charcoal-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Customer & Order Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-charcoal-900 mb-2">Customer</h4>
                  <p className="text-charcoal-900">{order.user?.first_name} {order.user?.last_name}</p>
                  <p className="text-sm text-charcoal-500">{order.user?.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-charcoal-900 mb-2">Order Info</h4>
                  <p className="text-sm text-charcoal-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                  <p className="text-sm text-charcoal-600">Total: ${order.total_amount}</p>
                  <p className="text-sm text-charcoal-600">Status: {getFulfillmentStatusBadge(order.status)}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-medium text-charcoal-900 mb-4">Items ({order.order_items?.length || 0})</h4>
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-sand-50 rounded-xl">
                      <img
                        src={getImageSrc(item.product_image || item.product?.images?.[0])}
                        alt={item.product_name || item.product?.name}
                        className="w-16 h-16 rounded-lg object-cover border border-sand-200"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-charcoal-900">
                          {item.product_name || item.product?.name}
                        </h5>
                        {item.product_sku && (
                          <p className="text-sm text-charcoal-500">SKU: {item.product_sku}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-charcoal-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-charcoal-900">${item.total_price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h4 className="font-medium text-charcoal-900 mb-3">Shipping Address</h4>
                <div className="bg-sand-50 p-4 rounded-xl">
                  <p className="text-charcoal-900">{order.formatted_shipping_address}</p>
                  {order.tracking_number && (
                    <p className="text-sm text-charcoal-600 mt-2">
                      <span className="font-medium">Tracking:</span> {order.tracking_number}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-sand-200">
                {canUpdateStatus(order, 'processing') && (
                  <button
                    onClick={() => {
                      handleStatusChange('processing')
                      setShowDetailsModal(false)
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Processing
                  </button>
                )}
                
                {canUpdateStatus(order, 'shipped') && (
                  <button
                    onClick={() => {
                      setShowDetailsModal(false)
                      handleStatusChange('shipped')
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    Mark Shipped
                  </button>
                )}
                
                {canUpdateStatus(order, 'cancelled') && (
                  <button
                    onClick={() => {
                      handleStatusChange('cancelled')
                      setShowDetailsModal(false)
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Mark Order as Shipped</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full px-3 py-2 border border-sand-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-sand-300 rounded-xl text-charcoal-700 font-medium hover:bg-sand-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShippedSubmit}
                disabled={isUpdating}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Mark as Shipped
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}