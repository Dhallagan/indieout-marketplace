import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMyProducts, deleteProduct } from '@/services/productService'
import { Product } from '@/types/api-generated'
import { useToast } from '@/contexts/ToastContext'
import SellerLayout from '@/components/seller/SellerLayout'

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [deletingProducts, setDeletingProducts] = useState<Set<string>>(new Set())
  const { addToast } = useToast()

  useEffect(() => {
    loadProducts()
  }, [statusFilter, searchTerm])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const status = statusFilter === 'all' ? undefined : statusFilter
      const data = await getMyProducts(status)
      
      // Filter by search term on the frontend
      let filteredData = data
      if (searchTerm) {
        filteredData = data.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setProducts(filteredData)
    } catch (error) {
      console.error('Failed to load products:', error)
      addToast('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingProducts(prev => new Set(prev).add(productId))
      await deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
      addToast('Product deleted successfully', 'success')
    } catch (error) {
      console.error('Failed to delete product:', error)
      addToast(error instanceof Error ? error.message : 'Failed to delete product', 'error')
    } finally {
      setDeletingProducts(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products? This action cannot be undone.`)) {
      return
    }

    try {
      await Promise.all(Array.from(selectedProducts).map(id => deleteProduct(id)))
      setProducts(products.filter(p => !selectedProducts.has(p.id)))
      setSelectedProducts(new Set())
      addToast(`${selectedProducts.size} products deleted successfully`, 'success')
    } catch (error) {
      console.error('Failed to delete products:', error)
      addToast('Failed to delete some products', 'error')
      loadProducts() // Reload to show current state
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const next = new Set(prev)
      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)))
    }
  }

  const getStatusBadge = (status: string, inventory?: number) => {
    const statusConfig = {
      'active': { label: 'Active', color: 'bg-green-100 text-green-800' },
      'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      'archived': { label: 'Archived', color: 'bg-red-100 text-red-800' }
    }[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    )
  }

  const getInventoryBadge = (product: Product) => {
    if (!product.track_inventory) {
      return (
        <span className="text-xs text-charcoal-500">Not tracked</span>
      )
    }

    const inventory = product.total_inventory || product.inventory || 0
    const threshold = product.low_stock_threshold || 5

    if (inventory <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of stock
        </span>
      )
    }

    if (inventory <= threshold) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low stock ({inventory})
        </span>
      )
    }

    return (
      <span className="text-sm text-charcoal-900">{inventory} in stock</span>
    )
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
            <h1 className="text-2xl font-semibold text-charcoal-900">Products</h1>
            <p className="text-charcoal-600 mt-1">{products.length} products</p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                Delete ({selectedProducts.size})
              </button>
            )}
            <button className="px-4 py-2 border border-sand-300 text-charcoal-700 rounded-xl font-medium hover:bg-sand-50 transition-colors">
              Export
            </button>
            <Link
              to="/seller/products/new"
              className="px-4 py-2 bg-forest-600 text-white rounded-xl font-medium hover:bg-forest-700 transition-colors"
            >
              Add product
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-sand-200/60 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: products.length },
                { key: 'active', label: 'Active', count: products.filter(p => p.status === 'active').length },
                { key: 'draft', label: 'Draft', count: products.filter(p => p.status === 'draft').length },
                { key: 'archived', label: 'Archived', count: products.filter(p => p.status === 'archived').length }
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
                placeholder="Search products..."
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

        {/* Products Table */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-sand-200/60 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
            <p className="text-charcoal-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-sand-200/60 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-sand-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No products found</h3>
            <p className="text-charcoal-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't created any products yet. Start building your catalog!"
                : `No products with status "${statusFilter}" found.`
              }
            </p>
            <Link
              to="/seller/products/new"
              className="bg-forest-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-forest-700 transition-colors"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-sand-200/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand-25 border-b border-sand-200/60">
                  <tr>
                    <th className="text-left py-4 px-6 w-12">
                      <input
                        type="checkbox"
                        checked={selectedProducts.size === products.length && products.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-forest-600 border-sand-300 rounded focus:ring-forest-500"
                      />
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Product</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Inventory</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Type</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Vendor</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-200/60">
                  {products.map((product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      isSelected={selectedProducts.has(product.id)}
                      onToggleSelect={() => toggleProductSelection(product.id)}
                      onDelete={() => handleDeleteProduct(product.id)}
                      isDeleting={deletingProducts.has(product.id)}
                      getStatusBadge={getStatusBadge}
                      getInventoryBadge={getInventoryBadge}
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

interface ProductRowProps {
  product: Product
  isSelected: boolean
  onToggleSelect: () => void
  onDelete: () => void
  isDeleting: boolean
  getStatusBadge: (status: string, inventory?: number) => JSX.Element
  getInventoryBadge: (product: Product) => JSX.Element
  getImageSrc: (imageUrl?: string) => string
}

function ProductRow({ 
  product, 
  isSelected, 
  onToggleSelect, 
  onDelete, 
  isDeleting,
  getStatusBadge,
  getInventoryBadge,
  getImageSrc
}: ProductRowProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <tr className="hover:bg-sand-25 transition-colors">
      <td className="py-4 px-6">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="w-4 h-4 text-forest-600 border-sand-300 rounded focus:ring-forest-500"
        />
      </td>
      
      <td className="py-4 px-6">
        <div className="flex items-center space-x-4">
          <img
            src={getImageSrc(product.images?.[0])}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover border border-sand-200"
          />
          <div className="min-w-0 flex-1">
            <Link
              to={`/seller/products/${product.id}/edit`}
              className="text-sm font-medium text-charcoal-900 hover:text-forest-600 transition-colors"
            >
              {product.name}
            </Link>
            {product.sku && (
              <p className="text-xs text-charcoal-500 mt-1">SKU: {product.sku}</p>
            )}
          </div>
        </div>
      </td>
      
      <td className="py-4 px-6">
        {getStatusBadge(product.status)}
      </td>
      
      <td className="py-4 px-6">
        {getInventoryBadge(product)}
      </td>
      
      <td className="py-4 px-6">
        <span className="text-sm text-charcoal-600">
          {product.category?.name || 'Uncategorized'}
        </span>
      </td>
      
      <td className="py-4 px-6">
        <span className="text-sm text-charcoal-600">
          {product.store?.name}
        </span>
      </td>
      
      <td className="py-4 px-6 text-right">
        <div className="flex items-center justify-end space-x-2">
          <Link
            to={`/seller/products/${product.id}/edit`}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white shadow-xl rounded-xl border border-sand-200/60 py-2 z-10">
                <Link
                  to={`/products/${product.slug || product.id}`}
                  className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-sand-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  View in store
                </Link>
                <Link
                  to={`/seller/products/${product.id}/duplicate`}
                  className="block px-4 py-2 text-sm text-charcoal-700 hover:bg-sand-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  Duplicate
                </Link>
                <div className="border-t border-sand-200/60 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowDropdown(false)
                      onDelete()
                    }}
                    disabled={isDeleting}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete product'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}