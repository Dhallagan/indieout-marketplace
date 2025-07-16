import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import SellerLayout from '@/components/seller/SellerLayout'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import { getMyProducts } from '@/services/productService'
import { sellerOrderService } from '@/services/sellerOrderService'
import { Product, Order } from '@/types/api-generated'

export default function SellerDashboardPage() {
  const { user, hasRole } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (user?.store) {
      loadDashboardData()
    }
  }, [user?.store])
  
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [productsData, ordersData] = await Promise.all([
        getMyProducts(),
        sellerOrderService.getStoreOrders({})
      ])
      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // Calculate metrics
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.status === 'active').length
  const draftProducts = products.filter(p => p.status === 'draft').length
  const lowStockProducts = products.filter(p => {
    const inventory = p.total_inventory || p.inventory || 0
    const threshold = p.low_stock_threshold || 5
    return p.track_inventory && inventory <= threshold
  }).length
  
  const totalOrders = orders.length
  const newOrders = orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length
  const todaysOrders = orders.filter(o => {
    const orderDate = new Date(o.created_at)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  }).length
  
  const totalRevenue = orders
    .filter(o => !['cancelled', 'refunded'].includes(o.status))
    .reduce((sum, order) => sum + parseFloat(order.total_amount), 0)

  if (!hasRole(UserRole.SELLER_ADMIN)) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Access Denied</h1>
          </div>
          <Card sectioned>
            <div className="text-center py-8">
              <p className="text-charcoal-600 mb-4">You need seller privileges to access this page.</p>
              <Link to="/shop">
                <Button variant="primary">Back to Shop</Button>
              </Link>
            </div>
          </Card>
        </div>
      </SellerLayout>
    )
  }

  if (loading) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-sand-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-sand-100 rounded w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-16 bg-sand-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-sand-100 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </SellerLayout>
    )
  }

  return (
    <SellerLayout>
      <div className="space-y-8">
        {/* Header with Key Metrics */}
        <div>
          <h1 className="text-2xl font-semibold text-charcoal-900 mb-2">Store Overview</h1>
          <p className="text-charcoal-600">Here's what's happening with {user?.store?.name} today</p>
        </div>

        {user?.store ? (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Today's Orders */}
              <div className="bg-gradient-to-br from-forest-50 to-forest-25 rounded-2xl p-6 border border-forest-200/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  {todaysOrders > 0 && (
                    <span className="text-xs font-semibold text-forest-700 bg-forest-200/80 px-3 py-1.5 rounded-full">
                      +{todaysOrders} today
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-forest-900">{totalOrders}</p>
                  <p className="text-sm text-forest-700 font-medium">Total Orders</p>
                </div>
              </div>

              {/* New Orders */}
              <div className="bg-gradient-to-br from-terra-50 to-terra-25 rounded-2xl p-6 border border-terra-200/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-terra-600 to-terra-700 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  {newOrders > 0 && (
                    <span className="text-xs font-semibold text-terra-700 bg-terra-200/80 px-3 py-1.5 rounded-full">
                      Action needed
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-terra-900">{newOrders}</p>
                  <p className="text-sm text-terra-700 font-medium">Awaiting Fulfillment</p>
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-gradient-to-br from-clay-50 to-clay-25 rounded-2xl p-6 border border-clay-200/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-clay-600 to-clay-700 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-clay-900">${totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-clay-700 font-medium">Total Revenue</p>
                </div>
              </div>

              {/* Products */}
              <div className="bg-gradient-to-br from-sand-50 to-sand-25 rounded-2xl p-6 border border-sand-200/40 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sand-600 to-sand-700 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  {lowStockProducts > 0 && (
                    <span className="text-xs font-semibold text-terra-700 bg-terra-200/80 px-3 py-1.5 rounded-full">
                      {lowStockProducts} low stock
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-sand-900">{activeProducts}</p>
                  <p className="text-sm text-sand-700 font-medium">Active Products</p>
                </div>
              </div>
            </div>

            {/* Action Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Getting Started / Next Steps */}
              <div className="bg-gradient-to-br from-white to-sand-25/30 rounded-2xl p-6 border border-sand-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Next Steps</h3>
                <div className="space-y-4">
                  {totalProducts === 0 && (
                    <div className="flex items-start space-x-4 p-5 bg-gradient-to-r from-forest-50 to-forest-25 rounded-xl border border-forest-200/60 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-forest-900 mb-2">Add your first product</h4>
                        <p className="text-sm text-forest-700 mb-4">Start selling by adding products to your store</p>
                        <Link to="/seller/products/new">
                          <button className="text-sm font-semibold text-forest-600 hover:text-forest-700 bg-forest-100 hover:bg-forest-200 px-4 py-2 rounded-lg transition-colors">
                            Add product →
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {draftProducts > 0 && (
                    <div className="flex items-start space-x-4 p-5 bg-gradient-to-r from-clay-50 to-clay-25 rounded-xl border border-clay-200/60 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-clay-600 to-clay-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-clay-900 mb-2">Publish draft products</h4>
                        <p className="text-sm text-clay-700 mb-4">{draftProducts} products are ready to publish</p>
                        <Link to="/seller/products?status=draft">
                          <button className="text-sm font-semibold text-clay-600 hover:text-clay-700 bg-clay-100 hover:bg-clay-200 px-4 py-2 rounded-lg transition-colors">
                            Review drafts →
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {lowStockProducts > 0 && (
                    <div className="flex items-start space-x-4 p-5 bg-gradient-to-r from-terra-50 to-terra-25 rounded-xl border border-terra-200/60 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-terra-600 to-terra-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-terra-900 mb-2">Low stock alert</h4>
                        <p className="text-sm text-terra-700 mb-4">{lowStockProducts} products are running low</p>
                        <Link to="/seller/products">
                          <button className="text-sm font-semibold text-terra-600 hover:text-terra-700 bg-terra-100 hover:bg-terra-200 px-4 py-2 rounded-lg transition-colors">
                            Manage inventory →
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {newOrders > 0 && (
                    <div className="flex items-start space-x-4 p-5 bg-gradient-to-r from-forest-50 to-forest-25 rounded-xl border border-forest-200/60 shadow-sm">
                      <div className="w-10 h-10 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-forest-900 mb-2">New orders to fulfill</h4>
                        <p className="text-sm text-forest-700 mb-4">{newOrders} orders are waiting for fulfillment</p>
                        <Link to="/seller/orders?status=pending">
                          <button className="text-sm font-semibold text-forest-600 hover:text-forest-700 bg-forest-100 hover:bg-forest-200 px-4 py-2 rounded-lg transition-colors">
                            Process orders →
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {totalProducts > 0 && draftProducts === 0 && lowStockProducts === 0 && newOrders === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-forest-600 to-forest-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-forest-900 mb-2">All caught up!</h4>
                      <p className="text-sm text-forest-700">Your store is running smoothly</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-white to-sand-25/30 rounded-2xl p-6 border border-sand-200/60 shadow-sm">
                <h3 className="text-lg font-semibold text-charcoal-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/seller/products/new" className="group flex items-center justify-between p-4 rounded-xl border border-forest-200/60 bg-gradient-to-r from-forest-25 to-forest-50 hover:from-forest-50 hover:to-forest-75 transition-all duration-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-forest-600 to-forest-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                      <span className="font-semibold text-forest-900">Add Product</span>
                    </div>
                    <svg className="w-5 h-5 text-forest-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  <Link to="/seller/orders" className="group flex items-center justify-between p-4 rounded-xl border border-terra-200/60 bg-gradient-to-r from-terra-25 to-terra-50 hover:from-terra-50 hover:to-terra-75 transition-all duration-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-terra-600 to-terra-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      </div>
                      <span className="font-semibold text-terra-900">View Orders</span>
                    </div>
                    <svg className="w-5 h-5 text-terra-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  <Link to={`/shop/stores/${user.store.slug || user.store.id}`} className="group flex items-center justify-between p-4 rounded-xl border border-clay-200/60 bg-gradient-to-r from-clay-25 to-clay-50 hover:from-clay-50 hover:to-clay-75 transition-all duration-200 shadow-sm">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-clay-600 to-clay-700 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <span className="font-semibold text-clay-900">View Storefront</span>
                    </div>
                    <svg className="w-5 h-5 text-clay-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-r from-forest-50 to-sand-50 rounded-2xl shadow-sm border border-sand-200/60 p-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-forest-500 to-forest-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-charcoal-900 mb-4">Set Up Your Store</h3>
              <p className="text-charcoal-600 mb-8 text-lg max-w-md mx-auto">
                Create your store to start selling your outdoor products to adventure enthusiasts
              </p>
              <Link to="/store/setup">
                <button className="px-8 py-4 bg-forest-600 text-white text-lg font-semibold rounded-xl hover:bg-forest-700 transition-colors duration-200 shadow-sm">
                  Create Store
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  )
}