import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { Link } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import { getDashboardStats, DashboardStats } from '@/services/adminService'

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (hasRole(UserRole.SYSTEM_ADMIN)) {
      loadDashboardStats()
    }
  }, [hasRole])

  const loadDashboardStats = async () => {
    try {
      setStatsLoading(true)
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  // If user is admin, show admin layout
  if (hasRole(UserRole.SYSTEM_ADMIN) || hasRole(UserRole.SELLER_ADMIN)) {
    return (
      <AdminLayout>
        <Page
          title={`Welcome back, ${user?.first_name}!`}
          subtitle={
            hasRole(UserRole.SYSTEM_ADMIN) 
              ? 'System Administrator Dashboard' 
              : 'Seller Dashboard'
          }
        >
          {hasRole(UserRole.SYSTEM_ADMIN) && (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} sectioned>
                      <div className="animate-pulse">
                        <div className="h-8 bg-sand-200 rounded mb-2"></div>
                        <div className="h-6 bg-sand-100 rounded w-16"></div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <>
                    <Card sectioned>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-forest-600 mb-1">
                          {stats?.total_users || 0}
                        </div>
                        <div className="text-sm font-medium text-charcoal-600">Total Users</div>
                      </div>
                    </Card>
                    
                    <Card sectioned>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-forest-700 mb-1">
                          {stats?.total_sellers || 0}
                        </div>
                        <div className="text-sm font-medium text-charcoal-600">Sellers</div>
                        <div className="text-xs text-charcoal-500 mt-1">
                          {stats?.pending_sellers || 0} pending approval
                        </div>
                      </div>
                    </Card>
                    
                    <Card sectioned>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-clay-600 mb-1">
                          {stats?.total_products || 0}
                        </div>
                        <div className="text-sm font-medium text-charcoal-600">Products</div>
                      </div>
                    </Card>
                    
                    <Card sectioned>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-terra-600 mb-1">
                          {stats?.total_orders || 0}
                        </div>
                        <div className="text-sm font-medium text-charcoal-600">Orders</div>
                        <div className="text-xs text-charcoal-500 mt-1">
                          ${stats?.revenue_this_month || 0} this month
                        </div>
                      </div>
                    </Card>
                  </>
                )}
              </div>

              {/* Management Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card
                  title="Seller Management"
                  actions={
                    <Link to="/admin/sellers">
                      <Button variant="primary" size="small">
                        Manage Sellers
                      </Button>
                    </Link>
                  }
                  sectioned
                >
                  <p className="text-charcoal-600 mb-3">Review and approve new sellers joining the platform</p>
                  {stats && (
                    <div className="text-sm text-charcoal-500">
                      {stats.pending_sellers} pending approval • {stats.verified_sellers} verified
                    </div>
                  )}
                </Card>

                <Card
                  title="User Management"
                  actions={
                    <Link to="/admin/users">
                      <Button variant="primary" size="small">
                        Manage Users
                      </Button>
                    </Link>
                  }
                  sectioned
                >
                  <p className="text-charcoal-600 mb-3">Manage user accounts, roles, and permissions</p>
                  {stats && (
                    <div className="text-sm text-charcoal-500">
                      {stats.total_users} total users registered
                    </div>
                  )}
                </Card>

                <Card
                  title="Product Oversight"
                  actions={
                    <Link to="/admin/products">
                      <Button variant="primary" size="small">
                        View Products
                      </Button>
                    </Link>
                  }
                  sectioned
                >
                  <p className="text-charcoal-600 mb-3">Monitor products, feature items, and moderate content</p>
                  {stats && (
                    <div className="text-sm text-charcoal-500">
                      {stats.total_products} products listed
                    </div>
                  )}
                </Card>

                <Card
                  title="Categories"
                  actions={
                    <Link to="/admin/categories">
                      <Button variant="primary" size="small">
                        Manage
                      </Button>
                    </Link>
                  }
                  sectioned
                >
                  <p className="text-charcoal-600">Create and organize product categories for the marketplace</p>
                </Card>

                <Card
                  title="Hero Content"
                  actions={
                    <Link to="/admin/hero">
                      <Button variant="primary" size="small">
                        Edit
                      </Button>
                    </Link>
                  }
                  sectioned
                >
                  <p className="text-charcoal-600">Manage the main hero section and featured collections</p>
                </Card>
                
                <Card
                  title="System Settings"
                  actions={
                    <Button variant="primary" size="small" disabled>
                      Coming Soon
                    </Button>
                  }
                  sectioned
                >
                  <p className="text-charcoal-600">Configure platform settings and preferences</p>
                </Card>
              </div>
            </div>
          )}

          {hasRole(UserRole.SELLER_ADMIN) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.store ? (
                <>
                  <Card title="My Store" sectioned>
                    <div className="space-y-3">
                      <p className="font-medium">{user.store.name}</p>
                      <div className="flex space-x-2">
                        {user.store.is_verified ? (
                          <span className="px-2 py-1 text-xs bg-forest-100 text-forest-800 rounded">
                            Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Pending Verification
                          </span>
                        )}
                        {user.store.is_active ? (
                          <span className="px-2 py-1 text-xs bg-forest-100 text-forest-800 rounded">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-sand-100 text-charcoal-800 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                  
                  <Card
                    title="Manage Products"
                    actions={
                      <Link to="/seller/products">
                        <Button variant="primary" size="small">
                          Manage
                        </Button>
                      </Link>
                    }
                    sectioned
                  >
                    <p className="text-charcoal-600">Add and edit your product listings</p>
                  </Card>
                  
                  <Card
                    title="Orders"
                    actions={
                      <Button variant="primary" size="small">
                        View
                      </Button>
                    }
                    sectioned
                  >
                    <p className="text-charcoal-600">Process and fulfill customer orders</p>
                  </Card>
                </>
              ) : (
                <div className="col-span-full">
                  <Card title="Set Up Your Store" sectioned>
                    <div className="text-center py-8">
                      <p className="text-charcoal-600 mb-6">
                        Create your store to start selling your outdoor products
                      </p>
                      <Link to="/store/setup">
                        <Button variant="primary" size="large">
                          Create Store
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </Page>
      </AdminLayout>
    )
  }

  // Customer dashboard (non-admin layout)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-charcoal-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-charcoal-600">Customer Dashboard</p>
      </div>

      <div className="space-y-6">
        {/* Become a Seller CTA */}
        <div className="bg-gradient-to-r from-forest-600 to-forest-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">Start selling your outdoor gear</h3>
              <p className="text-forest-100">
                Join our curated marketplace of independent outdoor brands
              </p>
            </div>
            <Link 
              to="/apply-to-sell"
              className="bg-white text-forest-600 px-6 py-3 rounded-lg font-semibold hover:bg-sand-100 transition-colors"
            >
              Apply to Sell
            </Link>
          </div>
        </div>

        {/* Customer Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Browse Products</h3>
            <p className="text-charcoal-600 mb-4">Discover amazing outdoor gear</p>
            <button className="bg-forest-600 text-white px-4 py-2 rounded hover:bg-forest-700">
              Shop Now
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">My Orders</h3>
            <p className="text-charcoal-600 mb-4">Track your recent purchases</p>
            <button className="bg-forest-600 text-white px-4 py-2 rounded hover:bg-forest-700">
              View Orders
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Wishlist</h3>
            <p className="text-charcoal-600 mb-4">Save items for later</p>
            <button className="bg-forest-600 text-white px-4 py-2 rounded hover:bg-forest-700">
              View Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}