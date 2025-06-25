import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '@/types/api-generated'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'

interface ProductCardProps {
  product: Product
  showStore?: boolean
  size?: 'small' | 'medium' | 'large'
}

export default function ProductCard({ product, showStore = true, size = 'medium' }: ProductCardProps) {
  const { addToCart, isInCart } = useCart()
  const { addToast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  
  const getImageSrc = () => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder-product.svg'
    }
    
    // For now, just return the first image URL directly
    // TODO: Implement proper image size handling when backend supports derivatives
    return product.images[0]
  }

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAdding(true)
    try {
      await addToCart(product.id, 1)
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsAdding(false)
    }
  }

  const cardSizes = {
    small: 'max-w-xs',
    medium: 'max-w-sm',
    large: 'max-w-md'
  }

  const imageSizes = {
    small: 'h-48',
    medium: 'h-64', 
    large: 'h-80'
  }

  return (
    <div className={`bg-white rounded-lg shadow-card overflow-hidden hover:shadow-lg transition-shadow duration-200 ${cardSizes[size]}`}>
      <Link to={`/shop/products/${product.slug || product.id}`}>
        <div className={`relative ${imageSizes[size]} bg-gray-200 overflow-hidden`}>
          <img
            src={getImageSrc()}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
          
          {product.is_featured && (
            <div className="absolute top-2 left-2">
              <span className="bg-forest-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                Featured
              </span>
            </div>
          )}
          
          {product.compare_at_price && product.compare_at_price > product.base_price && (
            <div className="absolute top-2 right-2">
              <span className="bg-clay-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                Sale
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        {showStore && product.store && (
          <div className="flex items-center justify-between mb-4">
            <Link 
              to={`/shop/stores/${product.store.slug || product.store.id}`}
              className="flex items-center space-x-3 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {product.store.name.charAt(0)}
                </span>
              </div>
              <div>
                <span className="text-sm font-bold text-charcoal-700 group-hover:text-forest-600 transition-colors block">
                  {product.store.name}
                </span>
                {product.store.verification_status === 'verified' && (
                  <div className="flex items-center mt-1">
                    <svg className="w-3 h-3 text-forest-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium text-forest-600">Verified</span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}

        <Link to={`/shop/products/${product.slug || product.id}`}>
          <h3 className="font-bold text-lg text-charcoal-900 hover:text-forest-600 transition-colors mb-3 line-clamp-2 leading-tight">
            {product.name}
          </h3>
        </Link>

        {product.short_description && (
          <p className="text-sm text-charcoal-600 mb-4 line-clamp-2 leading-relaxed">
            {product.short_description}
          </p>
        )}

        <div className="flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline space-x-2 mb-1">
              <span className="font-black text-xl text-charcoal-900">
                ${Number(product.base_price).toFixed(2)}
              </span>
              {product.compare_at_price && Number(product.compare_at_price) > Number(product.base_price) && (
                <span className="text-sm text-charcoal-500 line-through">
                  ${Number(product.compare_at_price).toFixed(2)}
                </span>
              )}
            </div>
            
            {product.has_variants && (
              <span className="text-xs text-charcoal-500 font-medium">
                {product.variant_count} options available
              </span>
            )}
            
            {product.track_inventory && product.stock_status !== 'in_stock' && (
              <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block font-medium ${
                product.stock_status === 'out_of_stock' 
                  ? 'text-red-700 bg-red-100'
                  : 'text-amber-700 bg-amber-100'
              }`}>
                {product.stock_status === 'out_of_stock' 
                  ? 'Out of stock'
                  : `Only ${product.total_inventory} left!`
                }
              </span>
            )}
          </div>
          
          {/* Quick Add Button */}
          <button 
            onClick={handleQuickAdd}
            disabled={isAdding || product.out_of_stock}
            className="bg-forest-600 hover:bg-forest-700 disabled:bg-charcoal-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300 flex items-center space-x-1"
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-b-transparent"></div>
                <span>Adding...</span>
              </>
            ) : product.out_of_stock ? (
              <span>Out of Stock</span>
            ) : isInCart(product.id) ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Add More</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Quick Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}