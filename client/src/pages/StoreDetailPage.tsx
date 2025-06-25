import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ProductGrid from '@/components/ProductGrid'
import { getProducts } from '@/services/productService'
import { getStore } from '@/services/storeService'
import { Product, Store } from '@/types/api-generated'

export default function StoreDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [store, setStore] = useState<Store | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    if (slug) {
      loadStoreData()
    }
  }, [slug])

  const loadStoreData = async () => {
    try {
      setIsLoading(true)
      setIsLoadingProducts(true)
      
      if (!slug) return
      
      // Load store data from API
      const storeData = await getStore(slug)
      setStore(storeData)
      
      // Load store products
      const storeProductsResult = await getProducts({ store_id: storeData.id })
      setProducts(storeProductsResult.products)
      
    } catch (error) {
      console.error('Failed to load store data:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingProducts(false)
    }
  }

  const getImageSrc = (imageUrl?: string, size: 'thumb' | 'medium' | 'large' = 'medium') => {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return '/placeholder-product.svg'
    }
    // For now, just return the image URL directly
    // TODO: Implement proper image size handling when backend supports derivatives
    return imageUrl
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Store Not Found</h1>
          <p className="text-charcoal-600 mb-6">The store you're looking for doesn't exist.</p>
          <Link
            to="/shop"
            className="bg-forest-600 text-white px-6 py-3 rounded-lg hover:bg-forest-700 transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-charcoal-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/shop" className="text-charcoal-500 hover:text-charcoal-700">Shop</Link>
            <svg className="w-4 h-4 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-charcoal-500">Stores</span>
            <svg className="w-4 h-4 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-charcoal-900 font-medium">{store.name}</span>
          </nav>
        </div>
      </div>

      {/* Store Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Store Logo */}
            <div className="flex-shrink-0">
              <img
                src={getImageSrc(store.logo, 'large')}
                alt={store.name}
                className="w-24 h-24 rounded-full border-4 border-sand-200"
              />
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-charcoal-900">{store.name}</h1>
                {store.is_verified && (
                  <div className="flex items-center bg-forest-100 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 text-forest-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-forest-700">Verified Seller</span>
                  </div>
                )}
              </div>

              <p className="text-lg text-charcoal-600 mb-4 max-w-3xl">
                {store.description.split('\n')[0]}
              </p>

              {/* Store Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-charcoal-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>{products.length} Products</span>
                </div>
                
                <div className="flex items-center text-charcoal-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-1a1 1 0 011-1h6a1 1 0 011 1v1z" />
                  </svg>
                  <span>Since {new Date(store.created_at).getFullYear()}</span>
                </div>

                {store.website && (
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-forest-600 hover:text-forest-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Contact Button */}
            <div className="flex-shrink-0">
              <button className="bg-forest-600 text-white px-6 py-3 rounded-lg hover:bg-forest-700 transition-colors">
                Contact Seller
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Store Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-card p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-charcoal-900 mb-4">About This Store</h3>
              
              <div className="space-y-4 text-sm">
                <div className="space-y-3">
                  <p className="text-charcoal-700 leading-relaxed">
                    {store.description}
                  </p>
                </div>

                {/* Store Owner */}
                <div className="pt-4 border-t border-charcoal-200">
                  <h4 className="font-medium text-charcoal-900 mb-3">Store Owner</h4>
                  <div className="text-charcoal-600">
                    {store.owner?.first_name} {store.owner?.last_name}
                  </div>
                </div>

                {/* Store Policies */}
                <div className="pt-4 border-t border-charcoal-200">
                  <h4 className="font-medium text-charcoal-900 mb-3">Store Policies</h4>
                  <div className="space-y-2 text-charcoal-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>30-day returns</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Lifetime warranty</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-forest-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Free shipping over $100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal-900">
                Products from {store.name}
              </h2>
              <p className="text-charcoal-600">
                {products.length} products
              </p>
            </div>

            <ProductGrid
              products={products}
              isLoading={isLoadingProducts}
              columns={3}
              showStore={false}
              emptyMessage="This store doesn't have any products yet."
            />
          </div>
        </div>
      </div>
    </div>
  )
}