import { Product } from '@/types/api-generated'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  title?: string
  subtitle?: string
  showStore?: boolean
  columns?: 2 | 3 | 4 | 5
  emptyMessage?: string
  className?: string
}

export default function ProductGrid({ 
  products, 
  isLoading = false,
  title,
  subtitle,
  showStore = true,
  columns = 4,
  emptyMessage = "No products found",
  className = ""
}: ProductGridProps) {
  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
  }

  if (isLoading) {
    return (
      <div className={className}>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h2 className="text-3xl font-bold text-charcoal-900 mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-charcoal-600">{subtitle}</p>}
          </div>
        )}
        
        <div className={`grid ${columnClasses[columns]} gap-3 sm:gap-4 lg:gap-6`}>
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-card overflow-hidden animate-pulse">
              <div className="h-64 bg-sand-200"></div>
              <div className="p-4">
                <div className="h-4 bg-sand-200 rounded mb-2"></div>
                <div className="h-4 bg-sand-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-sand-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className={className}>
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && <h2 className="text-3xl font-bold text-charcoal-900 mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-charcoal-600">{subtitle}</p>}
          </div>
        )}
        
        <div className="text-center py-12">
          <svg 
            className="mx-auto h-12 w-12 text-charcoal-400 mb-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
            />
          </svg>
          <p className="text-lg text-charcoal-500">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && <h2 className="text-3xl font-bold text-charcoal-900 mb-4">{title}</h2>}
          {subtitle && <p className="text-lg text-charcoal-600">{subtitle}</p>}
        </div>
      )}
      
      <div className={`grid ${columnClasses[columns]} gap-3 sm:gap-4 lg:gap-6`}>
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            showStore={showStore}
          />
        ))}
      </div>
    </div>
  )
}