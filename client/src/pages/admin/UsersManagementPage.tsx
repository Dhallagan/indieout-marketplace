import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import { getAllUsers, toggleUserStatus, changeUserRole, AdminUser } from '@/services/adminService'
import { impersonate } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function UsersManagementPage() {
  const navigate = useNavigate()
  const { setAuthData } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState<'all' | 'consumer' | 'seller_admin' | 'system_admin'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(userId))
      const updatedUser = await toggleUserStatus(userId)
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
    } catch (error) {
      console.error('Failed to toggle user status:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(userId))
      const updatedUser = await changeUserRole(userId, newRole)
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
    } catch (error) {
      console.error('Failed to change user role:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleImpersonate = async (userId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(userId))
      const authResponse = await impersonate(userId)
      setAuthData(authResponse.token, authResponse.user)
      
      // Navigate based on user role
      if (authResponse.user.role === 'seller_admin') {
        navigate('/seller/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Failed to impersonate user:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const filteredUsers = users.filter(user => {
    // Role filter
    if (filterRole !== 'all' && user.role !== filterRole) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.email.toLowerCase().includes(query) ||
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.store?.name.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'system_admin': return 'bg-red-100 text-red-800'
      case 'seller_admin': return 'bg-forest-100 text-forest-800'
      case 'consumer': return 'bg-sand-100 text-charcoal-800'
      default: return 'bg-sand-100 text-charcoal-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'system_admin': return 'Admin'
      case 'seller_admin': return 'Seller'
      case 'consumer': return 'Customer'
      default: return role
    }
  }

  return (
    <AdminLayout>
      <Page
        title="User Management"
        subtitle="View and manage all user accounts"
        actions={
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        }
      >
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-sand-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Users' },
              { key: 'consumer', label: 'Customers' },
              { key: 'seller_admin', label: 'Sellers' },
              { key: 'system_admin', label: 'Admins' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterRole(tab.key as any)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterRole === tab.key
                    ? 'bg-white text-charcoal-900 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs">
                  ({users.filter(u => tab.key === 'all' || u.role === tab.key).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} sectioned>
                <div className="animate-pulse">
                  <div className="h-6 bg-sand-200 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-sand-100 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card sectioned>
            <div className="text-center py-8">
              <p className="text-charcoal-600">No users found matching your criteria.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map(user => (
              <Card key={user.id} sectioned>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-charcoal-900">
                        {user.first_name} {user.last_name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                      {!user.is_active && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                      {!user.email_verified_at && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          Unverified
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Email:</span> {user.email}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.email_verified_at && (
                          <p className="text-sm text-charcoal-600">
                            <span className="font-medium">Verified:</span> {new Date(user.email_verified_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div>
                        {user.store && (
                          <>
                            <p className="text-sm text-charcoal-600">
                              <span className="font-medium">Store:</span> {user.store.name}
                            </p>
                            <p className="text-sm text-charcoal-600">
                              <span className="font-medium">Store Status:</span>{' '}
                              <span className={user.store.is_verified ? 'text-forest-600' : 'text-amber-600'}>
                                {user.store.is_verified ? 'Verified' : 'Pending'}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant={user.is_active ? 'secondary' : 'primary'}
                      size="small"
                      onClick={() => handleToggleStatus(user.id)}
                      disabled={processingIds.has(user.id)}
                    >
                      {processingIds.has(user.id) 
                        ? 'Processing...' 
                        : user.is_active 
                        ? 'Deactivate' 
                        : 'Activate'
                      }
                    </Button>

                    {/* Role Change Dropdown */}
                    {user.role !== 'system_admin' && (
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        disabled={processingIds.has(user.id)}
                        className="px-3 py-1.5 text-sm border border-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-500"
                      >
                        <option value="consumer">Customer</option>
                        <option value="seller_admin">Seller</option>
                        <option value="system_admin">Admin</option>
                      </select>
                    )}

                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleImpersonate(user.id)}
                      disabled={processingIds.has(user.id)}
                    >
                      {processingIds.has(user.id) ? 'Impersonating...' : 'Impersonate'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Page>
    </AdminLayout>
  )
}