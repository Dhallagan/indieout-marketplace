import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ProductCard from '@/components/ProductCard'
import { getProducts } from '@/services/productService'
import { Product } from '@/types/api-generated'

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  
  const searchQuery = searchParams.get('q') || ''
  const sortBy = searchParams.get('sort') || 'relevance'
  
  useEffect(() => {
    if (searchQuery) {
      loadSearchResults()
    } else {
      setProducts([])
      setIsLoading(false)
    }
  }, [searchQuery, sortBy, currentPage])
  
  const loadSearchResults = async () => {
    try {
      setIsLoading(true)
      
      const result = await getProducts({
        search: searchQuery,
        sort_by: sortBy === 'relevance' ? 'newest' : sortBy,
        page: currentPage,
        per_page: 24
      })
      
      setProducts(result.products)
      setTotalResults(result.meta?.total_count || 0)
      setTotalPages(result.meta?.total_pages || 1)
    } catch (error) {
      console.error('Failed to load search results:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('sort', newSort)
    window.location.href = `/search?${params.toString()}`
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  if (!searchQuery) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-4">
            Search for outdoor gear
          </h1>
          <p className="text-charcoal-600 mb-8">
            Enter a search term to find products from our marketplace.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-forest-600 hover:bg-forest-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500 transition-colors"
          >
            Browse all products
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">
              Search Results
            </h1>
            <p className="text-charcoal-600 mt-1">
              {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchQuery}"
            </p>
          </div>
          
          {/* Sort Dropdown */}
          {products.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-charcoal-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm border border-sand-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400"
              >
                <option value="relevance">Most Relevant</option>
                <option value="newest">Newest First</option>
                <option value="price_low_high">Price: Low to High</option>
                <option value="price_high_low">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600"></div>
        </div>
      )}
      
      {/* No Results */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-charcoal-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-medium text-charcoal-900 mb-2">
            No results found
          </h2>
          <p className="text-charcoal-600 mb-6">
            Try adjusting your search terms or browse our categories
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-4 py-2 border border-forest-600 text-sm font-medium rounded-xl text-forest-600 hover:bg-forest-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-500 transition-colors"
          >
            Browse all products
          </Link>
        </div>
      )}
      
      {/* Results Grid */}
      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-charcoal-700 bg-white border border-sand-200 rounded-lg hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-forest-600 text-white'
                          : 'text-charcoal-700 bg-white border border-sand-200 hover:bg-sand-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-charcoal-700 bg-white border border-sand-200 rounded-lg hover:bg-sand-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}