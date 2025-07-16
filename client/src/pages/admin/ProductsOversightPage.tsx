import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import { getAllProducts, toggleProductFeatured, updateProductStatus, AdminProduct } from '@/services/adminService'
import { getProductImageUrl } from '@/utils/imageHelpers'

export default function ProductsOversightPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getAllProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (productId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(productId))
      const updatedProduct = await toggleProductFeatured(productId)
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p))
    } catch (error) {
      console.error('Failed to toggle featured status:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const handleStatusChange = async (productId: string, newStatus: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(productId))
      const updatedProduct = await updateProductStatus(productId, newStatus)
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p))
    } catch (error) {
      console.error('Failed to update product status:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(productId)
        return newSet
      })
    }
  }

  const filteredProducts = products.filter(product => {
    // Status filter
    if (filterStatus !== 'all' && product.status !== filterStatus) return false
    
    // Category filter
    if (selectedCategory !== 'all' && product.category?.id !== selectedCategory) return false
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        product.name.toLowerCase().includes(query) ||
        product.store.name.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
      )
    }
    
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-forest-100 text-forest-800'
      case 'draft': return 'bg-amber-100 text-amber-800'
      case 'archived': return 'bg-charcoal-100 text-charcoal-800'
      default: return 'bg-sand-100 text-charcoal-800'
    }
  }

  // Get unique categories from products
  const categories = Array.from(new Set(products.map(p => p.category?.id).filter(Boolean)))
    .map(id => products.find(p => p.category?.id === id)?.category)
    .filter(Boolean) as { id: string; name: string }[]

  return (
    <AdminLayout>
      <Page
        title="Product Oversight"
        subtitle="Monitor and manage all marketplace products"
        actions={
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
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
              { key: 'all', label: 'All Products' },
              { key: 'active', label: 'Active' },
              { key: 'draft', label: 'Draft' },
              { key: 'archived', label: 'Archived' }
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
                  ({products.filter(p => tab.key === 'all' || p.status === tab.key).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} sectioned>
                <div className="animate-pulse">
                  <div className="h-48 bg-sand-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-sand-200 rounded mb-2"></div>
                  <div className="h-4 bg-sand-100 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card sectioned>
            <div className="text-center py-12">
              <p className="text-charcoal-600 mb-4">No products found matching your criteria.</p>
              <Button variant="outline" onClick={() => {
                setFilterStatus('all')
                setSelectedCategory('all')
                setSearchQuery('')
              }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} sectioned className="overflow-hidden">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-sand-100 mb-4">
                    <img
                      src="/placeholder-product.svg"
                      alt={product.name}
                      className="h-48 w-full object-cover object-center"
                    />
                    {product.is_featured && (
                      <div className="absolute top-2 left-2 bg-forest-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-900 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-charcoal-600">
                        by {product.store.name}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-forest-600">
                        ${product.price}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-charcoal-600">
                      <span>Stock: {product.inventory}</span>
                      <span>{product.category?.name}</span>
                    </div>

                    {!product.store.is_verified && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                        <p className="text-xs text-amber-800">
                          ⚠️ Store not verified
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-sand-200">
                      <div className="flex gap-2">
                        <Button
                          variant={product.is_featured ? 'secondary' : 'outline'}
                          size="small"
                          onClick={() => handleToggleFeatured(product.id)}
                          disabled={processingIds.has(product.id)}
                          className="flex-1"
                        >
                          {processingIds.has(product.id) 
                            ? 'Processing...' 
                            : product.is_featured 
                            ? 'Unfeature' 
                            : 'Feature'
                          }
                        </Button>
                        
                        <Link to={`/shop/products/${product.slug}`} className="flex-1">
                          <Button variant="outline" size="small" className="w-full">
                            View
                          </Button>
                        </Link>
                      </div>

                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product.id, e.target.value)}
                        disabled={processingIds.has(product.id)}
                        className="w-full px-3 py-1.5 text-sm border border-sand-200 rounded-md focus:outline-none focus:ring-2 focus:ring-forest-500"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
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