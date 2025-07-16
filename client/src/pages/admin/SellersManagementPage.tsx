import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import { getAllSellers, approveSeller, rejectSeller, toggleSellerStatus, AdminSeller } from '@/services/adminService'
import { impersonate } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'

export default function SellersManagementPage() {
  const navigate = useNavigate()
  const { login: authLogin } = useAuth()
  const [sellers, setSellers] = useState<AdminSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadSellers()
  }, [])

  const loadSellers = async () => {
    try {
      setLoading(true)
      const data = await getAllSellers()
      setSellers(data)
    } catch (error) {
      console.error('Failed to load sellers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveSeller = async (sellerId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(sellerId))
      const updatedSeller = await approveSeller(sellerId)
      setSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s))
    } catch (error) {
      console.error('Failed to approve seller:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(sellerId)
        return newSet
      })
    }
  }

  const handleRejectSeller = async (sellerId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(sellerId))
      const updatedSeller = await rejectSeller(sellerId)
      setSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s))
    } catch (error) {
      console.error('Failed to reject seller:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(sellerId)
        return newSet
      })
    }
  }

  const handleToggleStatus = async (sellerId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(sellerId))
      const updatedSeller = await toggleSellerStatus(sellerId)
      setSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s))
    } catch (error) {
      console.error('Failed to toggle seller status:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(sellerId)
        return newSet
      })
    }
  }

  const handleImpersonate = async (userId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(userId))
      const authResponse = await impersonate(userId)
      authLogin(authResponse.token, authResponse.user)
      navigate('/seller/dashboard')
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

  const filteredSellers = sellers.filter(seller => {
    if (filterStatus === 'all') return true
    return seller.verification_status === filterStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-forest-100 text-forest-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-sand-100 text-charcoal-800'
    }
  }

  return (
    <AdminLayout>
      <Page
        title="Seller Management"
        subtitle="Review and manage seller applications and accounts"
      >
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-sand-100 p-1 rounded-lg">
            {[
              { key: 'all', label: 'All Sellers' },
              { key: 'pending', label: 'Pending Approval' },
              { key: 'verified', label: 'Verified' },
              { key: 'rejected', label: 'Rejected' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key as any)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filterStatus === tab.key
                    ? 'bg-white text-charcoal-900 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-800'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-xs">
                  ({sellers.filter(s => tab.key === 'all' || s.verification_status === tab.key).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Sellers List */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} sectioned>
                <div className="animate-pulse">
                  <div className="h-6 bg-sand-200 rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-sand-100 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredSellers.length === 0 ? (
          <Card sectioned>
            <div className="text-center py-8">
              <p className="text-charcoal-600">No sellers found for the selected filter.</p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredSellers.map(seller => (
              <Card key={seller.id} sectioned>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-charcoal-900">
                        {seller.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(seller.verification_status)}`}>
                        {seller.verification_status}
                      </span>
                      {!seller.is_active && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-sand-100 text-charcoal-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Owner:</span> {seller.user.first_name} {seller.user.last_name}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Email:</span> {seller.user.email}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Store Email:</span> {seller.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Products:</span> {seller.total_products}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          <span className="font-medium">Joined:</span> {new Date(seller.created_at).toLocaleDateString()}
                        </p>
                        {seller.website && (
                          <p className="text-sm text-charcoal-600">
                            <span className="font-medium">Website:</span>{' '}
                            <a href={seller.website} target="_blank" rel="noopener noreferrer" className="text-forest-600 hover:underline">
                              {seller.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    {seller.description && (
                      <p className="text-sm text-charcoal-600 mb-4">
                        {seller.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {seller.verification_status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleApproveSeller(seller.id)}
                          disabled={processingIds.has(seller.id)}
                        >
                          {processingIds.has(seller.id) ? 'Approving...' : 'Approve'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleRejectSeller(seller.id)}
                          disabled={processingIds.has(seller.id)}
                        >
                          {processingIds.has(seller.id) ? 'Rejecting...' : 'Reject'}
                        </Button>
                      </>
                    )}
                    
                    {seller.verification_status === 'verified' && (
                      <Button
                        variant={seller.is_active ? 'secondary' : 'primary'}
                        size="small"
                        onClick={() => handleToggleStatus(seller.id)}
                        disabled={processingIds.has(seller.id)}
                      >
                        {processingIds.has(seller.id) 
                          ? 'Processing...' 
                          : seller.is_active 
                          ? 'Deactivate' 
                          : 'Activate'
                        }
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => window.open(`/shop/stores/${seller.slug}`, '_blank')}
                    >
                      View Store
                    </Button>

                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleImpersonate(seller.user.id)}
                      disabled={processingIds.has(seller.user.id)}
                    >
                      {processingIds.has(seller.user.id) ? 'Impersonating...' : 'Impersonate'}
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