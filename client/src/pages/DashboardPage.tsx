import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import SellerLayout from '@/components/seller/SellerLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import { getDashboardStats, DashboardStats } from '@/services/adminService'
import { addressService } from '@/services/addressService'
import { orderService } from '@/services/orderService'
import { Address, CreateAddressRequest } from '@/types/api-generated'
import { useToast } from '@/contexts/ToastContext'
import { profileService } from '@/services/profileService'

export default function DashboardPage() {
  const { user, hasRole } = useAuth()
  const [searchParams] = useSearchParams()
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

  // System Admin Dashboard
  if (hasRole(UserRole.SYSTEM_ADMIN)) {
    return (
      <AdminLayout>
        <Page
          title={`Welcome back, ${user?.first_name}!`}
          subtitle="System Administrator Dashboard"
        >
          {/* Admin content */}
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
        </Page>
      </AdminLayout>
    )
  }

  // Redirect sellers to their dedicated dashboard ONLY if they're not accessing customer functions
  if (hasRole(UserRole.SELLER_ADMIN) && !searchParams.get('tab')) {
    return <Navigate to="/seller/dashboard" replace />
  }

  // Customer dashboard with Etsy-style layout
  return <CustomerDashboard user={user} />
}

function CustomerDashboard({ user }: { user: any }) {
  const [searchParams] = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'account')

  const tabs = [
    { id: 'purchases', label: 'Orders', href: '/dashboard/purchases' },
    { id: 'account', label: 'Account', href: '/dashboard' },
    { id: 'addresses', label: 'Addresses', href: '/dashboard/addresses' },
    { id: 'security', label: 'Security', href: '/dashboard/security' },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/shop" className="hover:opacity-80 transition-opacity">
                <img 
                  src="/logo.png" 
                  alt="IndieOut" 
                  className="h-8 w-auto"
                />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-charcoal-900">Your Account</h1>
                <p className="text-sm text-charcoal-600">Welcome back, {user?.first_name}!</p>
              </div>
            </div>
            <Link 
              to="/shop"
              className="bg-forest-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-forest-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8 border-b border-sand-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-charcoal-900 text-charcoal-900'
                    : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
                } transition-colors`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'account' && <AccountTab user={user} />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'addresses' && <AddressesTab />}
        {activeTab === 'purchases' && <PurchasesTab />}
      </div>
    </div>
  )
}

function AccountTab({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isUpdating, setIsUpdating] = useState(false)
  const { addToast } = useToast()

  const handleSaveProfile = async () => {
    setIsUpdating(true)
    try {
      const updatedUser = await profileService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email: email
      })
      
      addToast('Profile updated successfully!', 'success')
      setIsEditing(false)
      
      // TODO: Update the user context with new data
      console.log('Profile updated:', updatedUser)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update profile', 'error')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <div className="bg-white rounded-lg border border-sand-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-charcoal-900">Profile Information</h2>
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-sand-50 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="bg-forest-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setFirstName(user?.first_name || '')
                  setLastName(user?.last_name || '')
                  setEmail(user?.email || '')
                }}
                className="px-6 py-2 border border-charcoal-300 rounded-lg text-sm font-medium text-charcoal-700 hover:bg-sand-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Name</label>
              <p className="text-charcoal-600">{user?.first_name} {user?.last_name}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Email</label>
              <p className="text-charcoal-600">{user?.email}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Member since</label>
              <p className="text-charcoal-600">
                {new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Seller CTA with IndieOut branding */}
      <div className="bg-gradient-to-r from-forest-600 to-forest-700 rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <img 
                  src="/logo.png" 
                  alt="IndieOut" 
                  className="h-8 w-auto brightness-0 invert"
                />
                <h3 className="text-2xl font-bold text-white">Become a Seller</h3>
              </div>
              <p className="text-forest-100 text-lg">
                Join our community of independent outdoor makers. Share your passion, reach adventure seekers, and grow your brand.
              </p>
              <div className="flex items-center space-x-6 mt-4 text-forest-100">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>5% commission</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Direct payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Marketing support</span>
                </div>
              </div>
            </div>
            <Link 
              to="/apply-to-sell"
              className="bg-white text-forest-600 px-8 py-4 rounded-lg font-semibold hover:bg-sand-50 transition-colors whitespace-nowrap text-lg shadow-lg hover:shadow-xl"
            >
              Apply to Sell
            </Link>
          </div>
        </div>
        <div className="bg-forest-800/30 px-8 py-4 backdrop-blur-sm">
          <p className="text-forest-100 text-sm">
            🏔️ Trusted by 100+ outdoor brands across the country
          </p>
        </div>
      </div>
    </div>
  )
}

function SecurityTab() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-sand-200 p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-6">Password</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Current Password</label>
            <input 
              type="password" 
              className="w-full max-w-md px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">New Password</label>
            <input 
              type="password" 
              className="w-full max-w-md px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">Confirm New Password</label>
            <input 
              type="password" 
              className="w-full max-w-md px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
            />
          </div>
        </div>
        
        <button className="mt-6 bg-charcoal-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-charcoal-800 transition-colors">
          Update Password
        </button>
      </div>
    </div>
  )
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    try {
      setLoading(true)
      const data = await addressService.getAddresses()
      setAddresses(data)
    } catch (error) {
      addToast('Failed to load addresses', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setShowAddForm(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowAddForm(true)
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      await addressService.deleteAddress(id)
      setAddresses(addresses.filter(addr => addr.id !== id))
      addToast('Address deleted successfully', 'success')
    } catch (error) {
      addToast('Failed to delete address', 'error')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await addressService.setDefaultAddress(id)
      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })))
      addToast('Default address updated', 'success')
    } catch (error) {
      addToast('Failed to update default address', 'error')
    }
  }

  const handleFormSuccess = (newAddress: Address) => {
    if (editingAddress) {
      setAddresses(addresses.map(addr => addr.id === newAddress.id ? newAddress : addr))
      addToast('Address updated successfully', 'success')
    } else {
      setAddresses([...addresses, newAddress])
      addToast('Address added successfully', 'success')
    }
    setShowAddForm(false)
    setEditingAddress(null)
  }

  if (showAddForm) {
    return <AddressForm 
      address={editingAddress} 
      onSuccess={handleFormSuccess}
      onCancel={() => {
        setShowAddForm(false)
        setEditingAddress(null)
      }}
    />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900">Shipping Addresses</h2>
          <p className="text-sm text-charcoal-600 mt-1">Manage your saved addresses for faster checkout</p>
        </div>
        <button 
          onClick={handleAddAddress}
          className="bg-forest-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-forest-700 transition-colors inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Address</span>
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-sand-200 p-12">
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-sand-100 rounded"></div>
            ))}
          </div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-lg border border-sand-200 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-charcoal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-charcoal-900 mb-2">No addresses saved</h3>
          <p className="text-charcoal-600 mb-6">Add an address to save time during checkout</p>
          <button 
            onClick={handleAddAddress}
            className="bg-forest-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white rounded-lg border border-sand-200 p-6 relative">
              {address.is_default && (
                <div className="absolute top-4 right-4">
                  <span className="bg-forest-100 text-forest-800 text-xs font-medium px-2 py-1 rounded">
                    Default
                  </span>
                </div>
              )}
              
              <div className="mb-4">
                <p className="font-medium text-charcoal-800 mb-2">{address.full_name}</p>
                <p className="text-charcoal-600 text-sm leading-relaxed">
                  {address.formatted_address}
                </p>
                {address.phone && (
                  <p className="text-charcoal-600 text-sm mt-1">{address.phone}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-sand-200">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditAddress(address)}
                    className="text-forest-600 hover:text-forest-700 text-sm font-medium"
                  >
                    Edit
                  </button>
                  {!address.is_default && (
                    <button 
                      onClick={() => handleSetDefault(address.id)}
                      className="text-forest-600 hover:text-forest-700 text-sm font-medium"
                    >
                      Set as default
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-clay-600 hover:text-clay-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressForm({ address, onSuccess, onCancel }: {
  address: Address | null
  onSuccess: (address: Address) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<CreateAddressRequest>({
    full_name: address?.full_name || '',
    address_line_1: address?.address_line_1 || '',
    address_line_2: address?.address_line_2 || '',
    city: address?.city || '',
    state: address?.state || '',
    zip_code: address?.zip_code || '',
    country: address?.country || 'US',
    phone: address?.phone || '',
    is_default: address?.is_default || false,
  })
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result: Address
      if (address) {
        result = await addressService.updateAddress(address.id, formData)
      } else {
        result = await addressService.createAddress(formData)
      }
      onSuccess(result)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to save address', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof CreateAddressRequest) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900">
            {address ? 'Edit Address' : 'Add New Address'}
          </h2>
          <p className="text-sm text-charcoal-600 mt-1">
            {address ? 'Update your address information' : 'Save a new address for faster checkout'}
          </p>
        </div>
        <button 
          onClick={onCancel}
          className="text-charcoal-600 hover:text-charcoal-800 text-sm font-medium"
        >
          Cancel
        </button>
      </div>

      <div className="bg-white rounded-lg border border-sand-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={handleChange('full_name')}
              className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              required
              value={formData.address_line_1}
              onChange={handleChange('address_line_1')}
              className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Apartment, suite, etc. (optional)
            </label>
            <input
              type="text"
              value={formData.address_line_2}
              onChange={handleChange('address_line_2')}
              className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={handleChange('city')}
                className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                State *
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={handleChange('state')}
                className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                required
                value={formData.zip_code}
                onChange={handleChange('zip_code')}
                className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Country *
              </label>
              <select
                required
                value={formData.country}
                onChange={handleChange('country')}
                className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Phone Number (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handleChange('phone')}
                className="w-full px-3 py-2 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={handleChange('is_default')}
              className="w-4 h-4 text-forest-600 border-charcoal-300 rounded focus:ring-forest-500"
            />
            <label htmlFor="is_default" className="ml-2 text-sm text-charcoal-700">
              Set as default address
            </label>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-sand-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-charcoal-300 rounded-lg text-charcoal-700 font-medium hover:bg-sand-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-forest-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-forest-700 disabled:bg-charcoal-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
              )}
              <span>{loading ? 'Saving...' : (address ? 'Update Address' : 'Save Address')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function PurchasesTab() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const userOrders = await orderService.getOrders()
        setOrders(userOrders)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Map internal status to customer-friendly status
  const getCustomerStatus = (internalStatus: string) => {
    switch (internalStatus) {
      case 'pending':
      case 'confirmed':
        return 'processing'
      case 'processing':
        return 'processing'
      case 'shipped':
        return 'shipped'
      case 'delivered':
        return 'delivered'
      case 'cancelled':
        return 'cancelled'
      case 'refunded':
        return 'refunded'
      default:
        return 'processing'
    }
  }

  // Map internal status to customer-friendly label
  const getStatusLabel = (internalStatus: string) => {
    switch (internalStatus) {
      case 'pending':
        return 'Order Placed'
      case 'confirmed':
        return 'Processing'
      case 'processing':
        return 'Preparing for Shipment'
      case 'shipped':
        return 'Shipped'
      case 'delivered':
        return 'Delivered'
      case 'cancelled':
        return 'Cancelled'
      case 'refunded':
        return 'Refunded'
      default:
        return 'Processing'
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true
    return getCustomerStatus(order.status) === filterStatus
  })
  
  return (
    <div className="space-y-8">
      {/* Header with filters */}
      <div className="bg-white rounded-lg border border-sand-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-charcoal-900">Your Orders</h2>
            <p className="text-sm text-charcoal-600 mt-1">Track your orders and manage your purchases</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search orders..."
                className="w-64 px-4 py-2 pl-10 border border-charcoal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
              />
              <svg className="w-4 h-4 absolute left-3 top-3 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Status filters */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'processing', label: 'Processing' },
            { key: 'shipped', label: 'Shipped' },
            { key: 'delivered', label: 'Delivered' }
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilterStatus(status.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status.key
                  ? 'bg-forest-600 text-white'
                  : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-sand-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
          <p className="text-charcoal-600">Loading your orders...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg border border-sand-200 p-12 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-charcoal-600">{error}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
          <div className="bg-gradient-to-r from-forest-600 to-forest-700 px-8 py-6">
            <h3 className="text-xl font-semibold text-white mb-2">Ready for your first adventure?</h3>
            <p className="text-forest-100">Discover handcrafted gear from independent outdoor makers</p>
          </div>
          
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sand-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            
            <h4 className="text-lg font-medium text-charcoal-900 mb-2">No orders yet</h4>
            <p className="text-charcoal-600 mb-8 max-w-md mx-auto">
              Start exploring our curated collection of outdoor gear from passionate makers who test their products on real adventures.
            </p>
            
            <div className="flex items-center justify-center space-x-4">
              <Link 
                to="/shop"
                className="bg-forest-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m6.5-6h3" />
                </svg>
                <span>Browse Products</span>
              </Link>
              
              <Link 
                to="/shop?featured=true"
                className="border-2 border-forest-600 text-forest-600 px-8 py-3 rounded-lg font-semibold hover:bg-forest-50 transition-colors"
              >
                View Featured
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg border border-sand-200 overflow-hidden">
              {/* Order Header */}
              <div className="bg-sand-50 px-6 py-4 border-b border-sand-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-sm text-charcoal-500">Order Number</p>
                      <p className="font-semibold text-charcoal-900">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Date Placed</p>
                      <p className="font-medium text-charcoal-900">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-charcoal-500">Total</p>
                      <p className="font-semibold text-charcoal-900">${order.total_amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getCustomerStatus(order.status) === 'processing' ? 'bg-blue-100 text-blue-800' :
                      getCustomerStatus(order.status) === 'shipped' ? 'bg-green-100 text-green-800' :
                      getCustomerStatus(order.status) === 'delivered' ? 'bg-forest-100 text-forest-800' :
                      getCustomerStatus(order.status) === 'cancelled' ? 'bg-red-100 text-red-800' :
                      getCustomerStatus(order.status) === 'refunded' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status ? getStatusLabel(order.status) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <Link 
                      key={item.id} 
                      to={`/shop/products/${item.product?.slug || item.product_id}`}
                      className="flex items-start space-x-4 p-3 rounded-lg hover:bg-sand-50 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={item.product_image || item.product?.images?.[0] || '/placeholder-product.svg'}
                          alt={item.product_name || item.product?.name}
                          className="w-20 h-20 rounded-lg object-cover border border-sand-200 group-hover:border-forest-300 transition-colors"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-charcoal-900 group-hover:text-forest-600 transition-colors">
                          {item.product_name || item.product?.name}
                        </h4>
                        <p className="text-sm text-charcoal-500">From {order.store?.name}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-charcoal-600">Qty: {item.quantity}</span>
                          <span className="font-semibold text-charcoal-900">${item.total_price}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}