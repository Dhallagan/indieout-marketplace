import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '@/components/ProductGrid'
import CategoryIcon from '@/components/CategoryIcon'
import { getProducts } from '@/services/productService'
import { getCategories } from '@/services/categoryService'
import { Product, Category } from '@/types/api-generated'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  )
  
  // Get filter parameters from URL
  const categoryFilter = searchParams.get('category')
  const featuredFilter = searchParams.get('featured') === 'true'
  const storeFilter = searchParams.get('store')


  useEffect(() => {
    loadData()
  }, [categoryFilter, featuredFilter, storeFilter, searchQuery, minPrice, maxPrice, selectedBrands])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Build filters for backend
      const filters: { category_slug?: string; store_id?: string } = {}
      if (categoryFilter) filters.category_slug = categoryFilter
      if (storeFilter) filters.store_id = storeFilter
      
      const [productsData, categoriesData] = await Promise.all([
        getProducts(filters), // Backend handles hierarchical filtering
        getCategories()
      ])
      
      let filteredProducts = productsData
      
      // Apply featured filter if specified (frontend filter)
      if (featuredFilter) {
        filteredProducts = filteredProducts.filter(p => p.is_featured)
      }
      
      // Apply search filter if specified (frontend filter)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.short_description?.toLowerCase().includes(query)
        )
      }
      
      // Apply price filters (frontend filter)
      if (minPrice || maxPrice) {
        filteredProducts = filteredProducts.filter(p => {
          const price = p.base_price
          if (minPrice && price < parseFloat(minPrice)) return false
          if (maxPrice && price > parseFloat(maxPrice)) return false
          return true
        })
      }
      
      // Apply brand filters (frontend filter)
      if (selectedBrands.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          selectedBrands.includes(p.store?.name || '')
        )
      }
      
      setProducts(filteredProducts)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load shop data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryFilter = (category: Category | null) => {
    const newParams = new URLSearchParams(searchParams)
    if (category) {
      newParams.set('category', category.slug || category.id)
    } else {
      newParams.delete('category')
    }
    setSearchParams(newParams)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const newParams = new URLSearchParams(searchParams)
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim())
    } else {
      newParams.delete('search')
    }
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setMinPrice('')
    setMaxPrice('')
    setSelectedBrands([])
    setSearchParams(new URLSearchParams())
  }

  const handlePriceFilter = () => {
    const newParams = new URLSearchParams(searchParams)
    if (minPrice) {
      newParams.set('minPrice', minPrice)
    } else {
      newParams.delete('minPrice')
    }
    if (maxPrice) {
      newParams.set('maxPrice', maxPrice)
    } else {
      newParams.delete('maxPrice')
    }
    setSearchParams(newParams)
  }

  const handleBrandFilter = (brandName: string, checked: boolean) => {
    let newBrands: string[]
    if (checked) {
      newBrands = [...selectedBrands, brandName]
    } else {
      newBrands = selectedBrands.filter(b => b !== brandName)
    }
    
    setSelectedBrands(newBrands)
    
    const newParams = new URLSearchParams(searchParams)
    if (newBrands.length > 0) {
      newParams.set('brands', newBrands.join(','))
    } else {
      newParams.delete('brands')
    }
    setSearchParams(newParams)
  }

  // Get current category for display
  const currentCategory = categoryFilter 
    ? categories.find(c => c.slug === categoryFilter || c.id === categoryFilter)
    : null

  // Get categories for filter sidebar - if we only have one top-level category,
  // show its children instead (like REI does with "Outdoor Gear" -> "Hiking, Camping, etc.")
  const topLevelCategories = categories.filter(cat => !cat.parent_id)
  const displayCategories = topLevelCategories.length === 1 && topLevelCategories[0]?.children?.length 
    ? topLevelCategories[0].children 
    : topLevelCategories.length > 0 
    ? topLevelCategories 
    : [
        // Fallback to common outdoor categories if no categories are loaded
        { id: 'hiking', name: 'Hiking & Backpacking', slug: 'hiking' },
        { id: 'camping', name: 'Camping & Shelters', slug: 'camping' },
        { id: 'climbing', name: 'Climbing & Mountaineering', slug: 'climbing' },
        { id: 'apparel', name: 'Outdoor Apparel', slug: 'apparel' },
        { id: 'footwear', name: 'Footwear', slug: 'footwear' },
        { id: 'accessories', name: 'Accessories', slug: 'accessories' },
      ] as Category[]

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Hero Banner with Background */}
      <div className="relative bg-gradient-to-r from-forest-800 via-forest-700 to-forest-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="mountainPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <polygon points="10,2 18,18 2,18" fill="currentColor" opacity="0.3"/>
                <polygon points="15,8 20,18 10,18" fill="currentColor" opacity="0.2"/>
                <polygon points="5,12 12,18 0,18" fill="currentColor" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#mountainPattern)"/>
          </svg>
        </div>
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight drop-shadow-lg">
              {featuredFilter ? '⚡ Featured Gear' : 
               currentCategory ? `${currentCategory.name} Collection` : 
               'Discover Epic Gear'}
            </h1>
            <p className="text-lg text-forest-100 max-w-2xl mx-auto drop-shadow-md mb-6">
              {featuredFilter ? 'Hand-selected adventure essentials from passionate creators' :
               currentCategory ? `Premium ${currentCategory.name.toLowerCase()} gear crafted by independent makers` :
               'Authentic outdoor equipment from independent creators who live the adventure'}
            </p>
            
            {/* Quick Category Pills */}
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${ 
                  !categoryFilter 
                    ? 'bg-white text-forest-800 shadow-lg' 
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}
              >
                All Gear
              </button>
              {displayCategories.slice(0, 5).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    categoryFilter === category.slug || categoryFilter === category.id
                      ? 'bg-white text-forest-800 shadow-lg'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sand-200 p-8 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-charcoal-900 tracking-tight uppercase">Refine</h3>
                {(categoryFilter || featuredFilter || searchQuery || minPrice || maxPrice || selectedBrands.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-forest-600 hover:text-forest-700 transition-colors uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Search within results */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Search</h4>
                <form onSubmit={handleSearch}>
                  <div className="flex items-center bg-white rounded-lg border-2 border-sand-200 hover:border-forest-300 focus-within:border-forest-500 transition-colors">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="flex-1 px-4 py-3 text-sm rounded-l-lg focus:outline-none placeholder-charcoal-400"
                    />
                    <button
                      type="submit"
                      className="bg-forest-600 text-white px-4 py-3 rounded-r-lg hover:bg-forest-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Browse by Type</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => handleCategoryFilter(null)}
                    className={`w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                      !categoryFilter 
                        ? 'bg-forest-600 text-white shadow-md transform scale-105' 
                        : 'text-charcoal-600 hover:bg-sand-50 border border-sand-200'
                    }`}
                  >
                    All Gear
                  </button>
                  {displayCategories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategoryFilter(category)}
                        className={`w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                          categoryFilter === category.slug || categoryFilter === category.id
                            ? 'bg-forest-600 text-white shadow-md transform scale-105'
                            : 'text-charcoal-600 hover:bg-sand-50 border border-sand-200'
                        }`}
                      >
                        {category.name}
                        {category.children && category.children.length > 0 && (
                          <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Show subcategories when parent is selected */}
                      {(categoryFilter === category.slug || categoryFilter === category.id) && category.children && category.children.length > 0 && (
                        <div className="ml-4 mt-2 space-y-2">
                          {category.children.map((subcategory) => (
                            <button
                              key={subcategory.id}
                              onClick={() => handleCategoryFilter(subcategory)}
                              className={`w-full text-left px-3 py-2 rounded-full text-xs font-medium transition-all ${
                                categoryFilter === subcategory.slug || categoryFilter === subcategory.id
                                  ? 'bg-forest-100 text-forest-700 border border-forest-200'
                                  : 'text-charcoal-500 hover:bg-sand-50 hover:text-charcoal-700'
                              }`}
                            >
                              {subcategory.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Price Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      onBlur={handlePriceFilter}
                      className="w-24 px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                    />
                    <span className="text-charcoal-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      onBlur={handlePriceFilter}
                      className="w-24 px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                    />
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: 'Under $50', min: '', max: '50' },
                      { label: '$50 - $100', min: '50', max: '100' },
                      { label: '$100 - $200', min: '100', max: '200' },
                      { label: '$200 - $500', min: '200', max: '500' },
                      { label: 'Over $500', min: '500', max: '' }
                    ].map((range) => (
                      <label key={range.label} className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 text-forest-600 border-sand-300 rounded focus:ring-forest-500"
                          checked={minPrice === range.min && maxPrice === range.max}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMinPrice(range.min)
                              setMaxPrice(range.max)
                              handlePriceFilter()
                            } else {
                              setMinPrice('')
                              setMaxPrice('')
                              handlePriceFilter()
                            }
                          }}
                        />
                        <span className="text-sm text-charcoal-600">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Brands</h4>
                <div className="space-y-2">
                  {['Peak Forge Co.', 'Wildland Threads', 'Summit Gear', 'Trail Makers', 'Alpine Craft'].map((brand) => (
                    <label key={brand} className="flex items-center space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-forest-600 border-sand-300 rounded focus:ring-forest-500"
                        checked={selectedBrands.includes(brand)}
                        onChange={(e) => handleBrandFilter(brand, e.target.checked)}
                      />
                      <span className="text-sm text-charcoal-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Filters */}
              <div>
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Special Collections</h4>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams)
                      if (featuredFilter) {
                        newParams.delete('featured')
                      } else {
                        newParams.set('featured', 'true')
                      }
                      setSearchParams(newParams)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                      featuredFilter
                        ? 'bg-forest-600 text-white shadow-md transform scale-105'
                        : 'text-charcoal-600 hover:bg-sand-50 border border-sand-200'
                    }`}
                  >
                    ⚡ Featured Gear
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-full text-sm font-semibold text-charcoal-600 hover:bg-sand-50 border border-sand-200 transition-all">
                    🏔️ New Arrivals
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-full text-sm font-semibold text-charcoal-600 hover:bg-sand-50 border border-sand-200 transition-all">
                    🔥 Best Sellers
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-full text-sm font-semibold text-charcoal-600 hover:bg-sand-50 border border-sand-200 transition-all">
                    💚 Eco-Friendly
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Filter Tags & Results Header */}
            <div className="mb-8">
              {/* Active Filter Tags */}
              {(categoryFilter || featuredFilter || searchQuery) && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-sm font-medium text-charcoal-600">Active filters:</span>
                  {categoryFilter && (
                    <span className="inline-flex items-center bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-sm font-medium">
                      {currentCategory?.name}
                      <button
                        onClick={() => handleCategoryFilter(null)}
                        className="ml-2 hover:text-forest-900"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {featuredFilter && (
                    <span className="inline-flex items-center bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-sm font-medium">
                      ⚡ Featured
                      <button
                        onClick={() => {
                          const newParams = new URLSearchParams(searchParams)
                          newParams.delete('featured')
                          setSearchParams(newParams)
                        }}
                        className="ml-2 hover:text-forest-900"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center bg-forest-100 text-forest-800 px-3 py-1 rounded-full text-sm font-medium">
                      "{searchQuery}"
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          const newParams = new URLSearchParams(searchParams)
                          newParams.delete('search')
                          setSearchParams(newParams)
                        }}
                        className="ml-2 hover:text-forest-900"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-2xl font-bold text-charcoal-800">
                    {isLoading ? 'Loading epic gear...' : `${products.length} ${products.length === 1 ? 'item' : 'items'} found`}
                  </p>
                  <p className="text-sm text-charcoal-500 mt-1">
                    {featuredFilter ? 'Curated by adventure experts' :
                     currentCategory ? `${currentCategory.name} essentials from trusted makers` :
                     searchQuery ? `Search results for "${searchQuery}"` :
                     'From independent makers worldwide'}
                  </p>
                </div>
                
                {/* Sort Options */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-charcoal-600">Sort:</span>
                  <select className="text-sm border-2 border-sand-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 bg-white font-medium min-w-[140px]">
                    <option>Best Match</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Newest Arrivals</option>
                    <option>Most Popular</option>
                    <option>Customer Rating</option>
                  </select>
                </div>
              </div>
            </div>

            <ProductGrid
              products={products}
              isLoading={isLoading}
              columns={3}
              showStore={true}
              emptyMessage={
                searchQuery 
                  ? `No gear matches "${searchQuery}" - try a different search!`
                  : categoryFilter 
                  ? `No ${currentCategory?.name.toLowerCase()} gear available yet - check back soon!`
                  : 'No gear available right now - adventure awaits!'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}