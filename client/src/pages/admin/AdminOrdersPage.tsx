import { useState, useEffect } from 'react'
import { adminOrderService, AdminOrderListParams, OrderStats } from '@/services/adminOrderService'
import { Order } from '@/types/api-generated'
import { useToast } from '@/contexts/ToastContext'
import AdminLayout from '@/components/admin/AdminLayout'
import { CalendarIcon, CurrencyDollarIcon, ShoppingBagIcon, TruckIcon } from '@heroicons/react/24/outline'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [filters, setFilters] = useState<AdminOrderListParams>({
    page: 1,
    per_page: 20,
    status: '',
    payment_status: '',
    search: '',
  })
  const [meta, setMeta] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState<string | null>(null)
  const [showRefundModal, setShowRefundModal] = useState<string | null>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    loadOrders()
    loadStats()
  }, [filters])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const { orders: data, meta: metaData } = await adminOrderService.getOrders(filters)
      setOrders(data)
      setMeta(metaData)
    } catch (error) {
      console.error('Failed to load orders:', error)
      addToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await adminOrderService.getStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await adminOrderService.updateOrderStatus(orderId, newStatus)
      addToast('Order status updated successfully', 'success')
      loadOrders()
    } catch (error) {
      console.error('Failed to update order status:', error)
      addToast(error instanceof Error ? error.message : 'Failed to update order status', 'error')
    }
  }

  const handleRefund = async (orderId: string) => {
    try {
      const amount = refundAmount ? parseFloat(refundAmount) : undefined
      await adminOrderService.refundOrder(orderId, amount, refundReason)
      addToast('Refund processed successfully', 'success')
      setShowRefundModal(null)
      setRefundAmount('')
      setRefundReason('')
      loadOrders()
    } catch (error) {
      console.error('Failed to process refund:', error)
      addToast(error instanceof Error ? error.message : 'Failed to process refund', 'error')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-indigo-100 text-indigo-800',
      'shipped': 'bg-green-100 text-green-800',
      'delivered': 'bg-forest-100 text-forest-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-purple-100 text-purple-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number | string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount.toString()))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Order Management</h1>
          <p className="text-charcoal-600 mt-1">View and manage all marketplace orders</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Total Orders</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">
                    {stats.total_orders.toLocaleString()}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    {stats.recent_orders} in last 30 days
                  </p>
                </div>
                <div className="p-3 bg-forest-50 rounded-xl">
                  <ShoppingBagIcon className="h-6 w-6 text-forest-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">
                    {formatCurrency(stats.total_revenue)}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    {formatCurrency(stats.recent_revenue)} in last 30 days
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">
                    {stats.status_breakdown.pending || 0}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Awaiting processing
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-sand-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-600">In Transit</p>
                  <p className="text-2xl font-bold text-charcoal-900 mt-1">
                    {(stats.status_breakdown.shipped || 0) + (stats.status_breakdown.processing || 0)}
                  </p>
                  <p className="text-xs text-charcoal-500 mt-1">
                    Being fulfilled
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-sand-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Search
              </label>
              <input
                type="text"
                placeholder="Order #, email, name..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Order Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Payment Status
              </label>
              <select
                value={filters.payment_status}
                onChange={(e) => setFilters({ ...filters, payment_status: e.target.value, page: 1 })}
                className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Per Page
              </label>
              <select
                value={filters.per_page}
                onChange={(e) => setFilters({ ...filters, per_page: parseInt(e.target.value), page: 1 })}
                className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-sand-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
              <p className="text-charcoal-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBagIcon className="h-12 w-12 text-charcoal-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No orders found</h3>
              <p className="text-charcoal-600">Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-sand-50 border-b border-sand-200">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Order</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Date</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Customer</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Store</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Total</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Payment</th>
                      <th className="text-left py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Status</th>
                      <th className="text-right py-3 px-6 text-xs font-semibold text-charcoal-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-sand-50">
                        <td className="py-4 px-6">
                          <p className="font-medium text-charcoal-900">#{order.order_number}</p>
                          <p className="text-sm text-charcoal-500">
                            {order.order_items?.length || 0} items
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-charcoal-900">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-charcoal-500">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm font-medium text-charcoal-900">
                            {order.user?.first_name} {order.user?.last_name}
                          </p>
                          <p className="text-xs text-charcoal-500">{order.user?.email}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-charcoal-900">{order.store?.name}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-semibold text-charcoal-900">
                            {formatCurrency(order.total_amount)}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setShowDetailsModal(order.id)}
                              className="text-forest-600 hover:text-forest-700"
                            >
                              View
                            </button>
                            {order.payment_status === 'completed' && order.status !== 'refunded' && (
                              <button
                                onClick={() => setShowRefundModal(order.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Refund
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {meta && meta.total_pages > 1 && (
                <div className="px-6 py-4 border-t border-sand-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-charcoal-600">
                      Showing {((meta.current_page - 1) * meta.per_page) + 1} to{' '}
                      {Math.min(meta.current_page * meta.per_page, meta.total_count)} of{' '}
                      {meta.total_count} orders
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page! - 1) })}
                        disabled={meta.current_page === 1}
                        className="px-3 py-1 border border-sand-300 rounded-lg text-sm disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Page {meta.current_page} of {meta.total_pages}
                      </span>
                      <button
                        onClick={() => setFilters({ ...filters, page: Math.min(meta.total_pages, filters.page! + 1) })}
                        disabled={meta.current_page === meta.total_pages}
                        className="px-3 py-1 border border-sand-300 rounded-lg text-sm disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Order Details Modal */}
        {showDetailsModal && (
          <OrderDetailsModal
            order={orders.find(o => o.id === showDetailsModal)!}
            onClose={() => setShowDetailsModal(null)}
            onStatusUpdate={handleStatusUpdate}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getPaymentStatusColor={getPaymentStatusColor}
          />
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Process Refund</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">
                    Refund Amount (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder="Leave empty for full refund"
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                  <p className="text-xs text-charcoal-500 mt-1">
                    Order total: {formatCurrency(orders.find(o => o.id === showRefundModal)?.total_amount || 0)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowRefundModal(null)
                    setRefundAmount('')
                    setRefundReason('')
                  }}
                  className="px-4 py-2 border border-sand-300 rounded-lg text-charcoal-700 hover:bg-sand-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRefund(showRefundModal)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Process Refund
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

// Order Details Modal Component
interface OrderDetailsModalProps {
  order: Order
  onClose: () => void
  onStatusUpdate: (orderId: string, status: string) => void
  formatCurrency: (amount: number | string) => string
  getStatusColor: (status: string) => string
  getPaymentStatusColor: (status: string) => string
}

function OrderDetailsModal({ 
  order, 
  onClose, 
  onStatusUpdate, 
  formatCurrency, 
  getStatusColor, 
  getPaymentStatusColor 
}: OrderDetailsModalProps) {
  const [newStatus, setNewStatus] = useState(order.status)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-sand-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-charcoal-900">
              Order #{order.order_number}
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Order Info Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-sm font-medium text-charcoal-600">Order Date</p>
              <p className="text-charcoal-900 mt-1">
                {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-600">Total Amount</p>
              <p className="text-charcoal-900 mt-1 font-semibold">
                {formatCurrency(order.total_amount)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-600">Payment Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getPaymentStatusColor(order.payment_status)}`}>
                {order.payment_status}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal-600">Order Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          {/* Customer & Store Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-sand-50 rounded-xl p-4">
              <h4 className="font-medium text-charcoal-900 mb-3">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-charcoal-600">Name:</span>{' '}
                  <span className="font-medium">{order.user?.first_name} {order.user?.last_name}</span>
                </p>
                <p>
                  <span className="text-charcoal-600">Email:</span>{' '}
                  <span className="font-medium">{order.user?.email}</span>
                </p>
                {order.shipping_address && (
                  <>
                    <p className="pt-2">
                      <span className="text-charcoal-600">Shipping Address:</span>
                    </p>
                    <p className="font-medium">
                      {order.shipping_address.firstName} {order.shipping_address.lastName}<br />
                      {order.shipping_address.address1}<br />
                      {order.shipping_address.address2 && <>{order.shipping_address.address2}<br /></>}
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}<br />
                      {order.shipping_address.country}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-sand-50 rounded-xl p-4">
              <h4 className="font-medium text-charcoal-900 mb-3">Store Information</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-charcoal-600">Store Name:</span>{' '}
                  <span className="font-medium">{order.store?.name}</span>
                </p>
                <p>
                  <span className="text-charcoal-600">Store ID:</span>{' '}
                  <span className="font-medium">{order.store?.id}</span>
                </p>
                {order.tracking_number && (
                  <p>
                    <span className="text-charcoal-600">Tracking Number:</span>{' '}
                    <span className="font-medium">{order.tracking_number}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h4 className="font-medium text-charcoal-900 mb-4">Order Items</h4>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 bg-sand-50 rounded-xl">
                  <img
                    src={item.product_snapshot?.images?.[0] || '/placeholder-product.svg'}
                    alt={item.product_snapshot?.name || 'Product'}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-charcoal-900">
                      {item.product_snapshot?.name || 'Product'}
                    </h5>
                    <p className="text-sm text-charcoal-600">
                      SKU: {item.product_snapshot?.sku || 'N/A'}
                    </p>
                    <p className="text-sm text-charcoal-600">
                      Quantity: {item.quantity} × {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-charcoal-900">
                      {formatCurrency(item.total_price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Totals */}
          <div className="bg-sand-50 rounded-xl p-4 mb-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">Shipping</span>
                <span className="font-medium">{formatCurrency(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-charcoal-600">Tax</span>
                <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sand-200">
                <span className="font-semibold text-charcoal-900">Total</span>
                <span className="font-semibold text-charcoal-900">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="bg-sand-50 rounded-xl p-4">
            <h4 className="font-medium text-charcoal-900 mb-3">Update Order Status</h4>
            <div className="flex items-center space-x-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="flex-1 px-3 py-2 border border-sand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button
                onClick={() => {
                  onStatusUpdate(order.id, newStatus)
                  onClose()
                }}
                disabled={newStatus === order.status}
                className="px-4 py-2 bg-forest-600 text-white rounded-lg hover:bg-forest-700 disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}