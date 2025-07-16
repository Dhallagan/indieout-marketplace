import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import { getDashboardStats, DashboardStats } from '@/services/adminService'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <Page title="Admin Dashboard" subtitle="Overview of marketplace activity">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} sectioned>
                <div className="animate-pulse">
                  <div className="h-4 bg-sand-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-sand-200 rounded w-32"></div>
                </div>
              </Card>
            ))}
          </div>
        </Page>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Page
        title="Admin Dashboard"
        subtitle="Overview of marketplace activity"
      >
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-charcoal-900">{stats?.total_users || 0}</p>
              </div>
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Total Sellers */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">Total Sellers</p>
                <p className="text-2xl font-bold text-charcoal-900">{stats?.total_sellers || 0}</p>
                <p className="text-xs text-charcoal-500 mt-1">
                  {stats?.verified_sellers || 0} verified
                </p>
              </div>
              <div className="w-12 h-12 bg-terra-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-terra-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Pending Sellers */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{stats?.pending_sellers || 0}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            {(stats?.pending_sellers || 0) > 0 && (
              <Link to="/admin/sellers?filter=pending" className="block mt-3">
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Review now →
                </button>
              </Link>
            )}
          </Card>

          {/* Total Products */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">Total Products</p>
                <p className="text-2xl font-bold text-charcoal-900">{stats?.total_products || 0}</p>
              </div>
              <div className="w-12 h-12 bg-clay-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-clay-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Total Orders */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-charcoal-900">{stats?.total_orders || 0}</p>
              </div>
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </Card>

          {/* Revenue Total */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-charcoal-900">
                  ${(stats?.revenue_total || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </Card>

          {/* This Month's Revenue */}
          <Card sectioned>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-charcoal-600 mb-1">This Month</p>
                <p className="text-2xl font-bold text-forest-600">
                  ${(stats?.revenue_this_month || 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card title="Quick Actions" sectioned>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/sellers"
              className="flex items-center space-x-3 p-4 rounded-lg border border-sand-200 hover:border-forest-400 hover:bg-forest-50 transition-colors"
            >
              <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Manage Sellers</h3>
                <p className="text-sm text-charcoal-600">Review and approve seller applications</p>
              </div>
            </Link>

            <Link
              to="/admin/users"
              className="flex items-center space-x-3 p-4 rounded-lg border border-sand-200 hover:border-forest-400 hover:bg-forest-50 transition-colors"
            >
              <div className="w-10 h-10 bg-terra-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-terra-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Manage Users</h3>
                <p className="text-sm text-charcoal-600">View and manage user accounts</p>
              </div>
            </Link>

            <Link
              to="/admin/products"
              className="flex items-center space-x-3 p-4 rounded-lg border border-sand-200 hover:border-forest-400 hover:bg-forest-50 transition-colors"
            >
              <div className="w-10 h-10 bg-clay-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-clay-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Product Oversight</h3>
                <p className="text-sm text-charcoal-600">Monitor and manage all products</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              className="flex items-center space-x-3 p-4 rounded-lg border border-sand-200 hover:border-forest-400 hover:bg-forest-50 transition-colors"
            >
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Categories</h3>
                <p className="text-sm text-charcoal-600">Organize product categories</p>
              </div>
            </Link>

            <Link
              to="/admin/banners"
              className="flex items-center space-x-3 p-4 rounded-lg border border-sand-200 hover:border-forest-400 hover:bg-forest-50 transition-colors"
            >
              <div className="w-10 h-10 bg-forest-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Banners</h3>
                <p className="text-sm text-charcoal-600">Manage promotional banners</p>
              </div>
            </Link>

            <Link
              to="/admin/hero"
              className="flex items-center space-x-3 p-4 rounded-lg border border-sand-200 hover:border-forest-400 hover:bg-forest-50 transition-colors"
            >
              <div className="w-10 h-10 bg-terra-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-terra-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Hero Content</h3>
                <p className="text-sm text-charcoal-600">Update homepage hero section</p>
              </div>
            </Link>
          </div>
        </Card>
      </Page>
    </AdminLayout>
  )
}