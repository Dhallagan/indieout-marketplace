import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { getMyProducts, deleteProduct } from '@/services/productService'
import { Product } from '@/types/api-generated'
import SellerLayout from '@/components/seller/SellerLayout'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'

export default function ProductManagementPage() {
  const { hasRole } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')

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
              <Link to="/dashboard">
                <Button variant="primary">Back to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      </SellerLayout>
    )
  }

  useEffect(() => {
    loadProducts()
  }, [statusFilter])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getMyProducts(statusFilter || undefined)
      setProducts(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await deleteProduct(productId)
      await loadProducts()
    } catch (err: any) {
      alert(err.message || 'Failed to delete product')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-sand-100 text-charcoal-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      active: 'bg-forest-100 text-forest-800',
      inactive: 'bg-clay-100 text-clay-800',
      rejected: 'bg-clay-100 text-clay-800'
    }

    return (
      <span className={`px-2 py-1 text-xs rounded ${styles[status as keyof typeof styles] || styles.draft}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Products</h1>
            <p className="text-charcoal-600 mt-1">Manage your product catalog</p>
          </div>
          <Link to="/seller/products/new">
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Button>
          </Link>
        </div>
        {error && (
          <Card sectioned>
            <div className="text-center">
              <p className="text-clay-600 mb-4">{error}</p>
              <Button onClick={loadProducts}>Try again</Button>
            </div>
          </Card>
        )}

        <Card sectioned>
          <div className="mb-6">
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-48 px-3 py-2 border border-charcoal-300 rounded-md focus:outline-none focus:ring-2 ring-forest-500"
            >
              <option value="">All Products</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600 mx-auto"></div>
              <p className="mt-2 text-charcoal-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No products yet</h3>
              <p className="text-charcoal-600 mb-6">Get started by adding your first product to your store.</p>
              <Link to="/seller/products/new">
                <Button variant="primary">Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border border-charcoal-200 rounded-lg p-4 hover:border-charcoal-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0] || '/placeholder-product.svg'} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-md bg-sand-100"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-sand-100 rounded-md flex items-center justify-center">
                            <svg className="w-6 h-6 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-charcoal-900">{product.name}</h3>
                            {getStatusBadge(product.status as string)}
                          </div>
                          
                          <p className="text-charcoal-600 text-sm mb-2 line-clamp-2">
                            {product.short_description || product.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-charcoal-500">
                            <span>${Number(product.base_price).toFixed(2)}</span>
                            <span>SKU: {product.sku || 'N/A'}</span>
                            <span>{product.inventory} in stock</span>
                            <span>Category: {product.category?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/seller/products/${product.id}/edit`}>
                        <Button variant="secondary" size="small">
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant="secondary" 
                        size="small"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </SellerLayout>
  )
}