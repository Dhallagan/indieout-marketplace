import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Product } from '@/types/api-generated'
import { getProduct, getProducts } from '@/services/productService'
import ProductGrid from '@/components/ProductGrid'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addToCart, isInCart, getCartItem } = useCart()
  const { addToast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRelated, setIsLoadingRelated] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  useEffect(() => {
    if (slug) {
      loadProduct()
    }
  }, [slug])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      if (!slug) return
      
      const productData = await getProduct(slug)
      setProduct(productData)
      
      // Load related products from same category
      if (productData.category_id) {
        setIsLoadingRelated(true)
        try {
          const relatedData = await getProducts({ category_id: productData.category_id })
          // Filter out current product and limit to 4 related products
          const filtered = relatedData
            .filter(p => p.id !== productData.id)
            .slice(0, 4)
          setRelatedProducts(filtered)
        } catch (error) {
          console.error('Failed to load related products:', error)
        } finally {
          setIsLoadingRelated(false)
        }
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getImageSrc = (imageUrl: string, size: 'thumb' | 'medium' | 'large' = 'large') => {
    if (!imageUrl || imageUrl.includes('placeholder')) {
      return '/placeholder-product.svg'
    }
    // For now, just return the image URL directly
    // TODO: Implement proper image size handling when backend supports derivatives
    return imageUrl
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setIsAddingToCart(true)
    try {
      await addToCart(product.id, quantity)
      
      // Reset quantity to 1 after adding
      setQuantity(1)
    } catch (error) {
      // Error handling is done in the context
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Product Not Found</h1>
          <p className="text-charcoal-600 mb-6">The product you're looking for doesn't exist.</p>
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
            {product.category && (
              <>
                <Link 
                  to={`/shop?category=${product.category.slug}`}
                  className="text-charcoal-500 hover:text-charcoal-700"
                >
                  {product.category.name}
                </Link>
                <svg className="w-4 h-4 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className="text-charcoal-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-white rounded-lg overflow-hidden mb-4 shadow-card">
              <img
                src={getImageSrc(product.images?.[selectedImage] || '')}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-forest-500' : 'border-charcoal-200 hover:border-charcoal-300'
                    }`}
                  >
                    <img
                      src={getImageSrc(image, 'thumb')}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Store Info - Less Prominent */}
            {product.store && (
              <div className="text-xs text-charcoal-500 mb-2">
                <span>Sold by </span>
                <Link
                  to={`/shop/stores/${product.store.slug}`}
                  className="text-charcoal-600 hover:text-forest-600 transition-colors"
                >
                  {product.store.name}
                </Link>
                {product.store.is_verified && (
                  <span className="ml-1">
                    <svg className="w-3 h-3 text-forest-500 inline" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </div>
            )}

            <h1 className="text-3xl font-bold text-charcoal-900 mb-4">{product.name}</h1>
            
            {product.short_description && (
              <p className="text-lg text-charcoal-600 mb-6">{product.short_description}</p>
            )}

            {/* Pricing */}
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-3xl font-bold text-charcoal-900">
                ${Number(product.base_price).toFixed(2)}
              </span>
              {product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price) && (
                <>
                  <span className="text-xl text-charcoal-500 line-through">
                    ${Number(product.compare_at_price).toFixed(2)}
                  </span>
                  <span className="bg-clay-100 text-clay-700 px-2 py-1 rounded-full text-sm font-medium">
                    Save ${(Number(product.compare_at_price) - Number(product.base_price)).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 mb-6 text-sm text-charcoal-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>30-day returns</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Free shipping over $100</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-forest-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Lifetime warranty</span>
              </div>
            </div>

            {/* Features */}
            {product.is_featured && (
              <div className="bg-forest-50 border border-forest-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-forest-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="text-forest-700 font-medium">Featured Product</span>
                </div>
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-4 mb-8">
              {product.materials && product.materials.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-charcoal-700">Materials: </span>
                  <span className="text-sm text-charcoal-600">{product.materials.join(', ')}</span>
                </div>
              )}
              
              {product.dimensions && (
                <div>
                  <span className="text-sm font-medium text-charcoal-700">Dimensions: </span>
                  <span className="text-sm text-charcoal-600">{product.dimensions}</span>
                </div>
              )}
              
              {product.weight && (
                <div>
                  <span className="text-sm font-medium text-charcoal-700">Weight: </span>
                  <span className="text-sm text-charcoal-600">{Number(product.weight)} lbs</span>
                </div>
              )}
              
              {product.sku && (
                <div>
                  <span className="text-sm font-medium text-charcoal-700">SKU: </span>
                  <span className="text-sm text-charcoal-600">{product.sku}</span>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-2">Quantity</label>
                  <div className="flex items-center border border-charcoal-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-sand-50 transition-colors rounded-l-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-3 py-2 text-center border-none focus:outline-none"
                      min="1"
                      max={Number(product.inventory)}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(Number(product.inventory), quantity + 1))}
                      className="p-2 hover:bg-sand-50 transition-colors rounded-r-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                {product.track_inventory && (
                  <div className="flex-1">
                    {Number(product.inventory) <= Number(product.low_stock_threshold) ? (
                      <div className="flex items-center text-sm text-clay-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        {Number(product.inventory) > 0 
                          ? `Only ${product.inventory} left in stock` 
                          : 'Out of stock'
                        }
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-forest-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        In stock
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!Number(product.inventory) || isAddingToCart}
                  className="flex-1 bg-forest-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-forest-700 disabled:bg-charcoal-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m6.5-6h3" />
                      </svg>
                      <span>
                        {Number(product.inventory) 
                          ? isInCart(product.id) 
                            ? 'Add More' 
                            : 'Add to Cart' 
                          : 'Out of Stock'
                        }
                      </span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implement wishlist functionality
                    addToast('Added to wishlist! (Wishlist functionality coming soon)', 'info')
                  }}
                  className="px-4 py-3 border border-charcoal-300 rounded-lg hover:bg-sand-50 transition-colors"
                  title="Add to Wishlist"
                >
                  <svg className="w-5 h-5 text-charcoal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Delivery Info */}
              <div className="bg-sand-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-forest-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-charcoal-900 text-sm">Shipping & Delivery</h4>
                    <p className="text-sm text-charcoal-600 mt-1">
                      Ships from {product.store?.name}. Usually ships within 2-3 business days.
                      {Number(product.base_price) >= 100 && (
                        <span className="text-forest-600 font-medium"> Free shipping!</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-card p-8">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-6">Product Description</h2>
            <div className="prose prose-charcoal max-w-none">
              <p className="text-charcoal-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product.category && relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-charcoal-900">
                More from {product.category.name}
              </h2>
              <Link
                to={`/shop?category=${product.category.slug}`}
                className="text-forest-600 hover:text-forest-700 font-medium text-sm flex items-center space-x-1"
              >
                <span>View all</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <ProductGrid 
              products={relatedProducts}
              isLoading={isLoadingRelated}
              columns={4}
              showStore={false}
              emptyMessage=""
            />
          </div>
        )}

        {/* Store Information */}
        {product.store && (
          <div className="mt-16">
            <div className="bg-white rounded-lg shadow-card p-8">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <img
                    src={product.store.logo || '/placeholder-product.svg'}
                    alt={product.store.name}
                    className="w-16 h-16 rounded-full border-2 border-sand-200"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-xl font-bold text-charcoal-900">{product.store.name}</h3>
                    {product.store.is_verified && (
                      <div className="flex items-center bg-forest-100 px-2 py-1 rounded-full">
                        <svg className="w-3 h-3 text-forest-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-forest-700">Verified</span>
                      </div>
                    )}
                  </div>
                  <p className="text-charcoal-600 mb-4 leading-relaxed">
                    {product.store.description}
                  </p>
                  <div className="flex items-center space-x-6">
                    <Link
                      to={`/shop/stores/${product.store.slug}`}
                      className="bg-forest-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-forest-700 transition-colors"
                    >
                      Visit Store
                    </Link>
                    <Link
                      to={`/shop?store=${product.store.id}`}
                      className="text-forest-600 hover:text-forest-700 text-sm font-medium"
                    >
                      More from this seller
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}