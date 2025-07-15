import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductGrid from '@/components/ProductGrid'
import CategoryIcon from '@/components/CategoryIcon'
import CategorySkeleton from '@/components/CategorySkeleton'
import { getProducts } from '@/services/productService'
import { getCategories } from '@/services/categoryService'
import { Product, Category } from '@/types/api-generated'
import { categoryCache } from '@/utils/categoryCache'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(() => {
    // Initialize with cached categories for instant display
    return categoryCache.get() || []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  )
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Get filter parameters from URL
  const categoryFilter = searchParams.get('category')
  const featuredFilter = searchParams.get('featured') === 'true'
  const storeFilter = searchParams.get('store')
  const sortBy = searchParams.get('sort') || 'newest'


  useEffect(() => {
    loadData()
  }, [categoryFilter, featuredFilter, storeFilter, minPrice, maxPrice, selectedBrands])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      // Build filters for backend
      const filters: { 
        category_slug?: string; 
        store_id?: string;
        search?: string;
        sort_by?: string;
        page?: number;
        per_page?: number;
      } = {
        page: currentPage,
        per_page: 24
      }
      
      if (categoryFilter) filters.category_slug = categoryFilter
      if (storeFilter) filters.store_id = storeFilter
      if (sortBy) filters.sort_by = sortBy
      
      // Load categories separately if not cached
      if (categories.length === 0) {
        setCategoriesLoading(true)
        getCategories().then(categoriesData => {
          setCategories(categoriesData)
          categoryCache.set(categoriesData)
          setCategoriesLoading(false)
        }).catch(() => {
          setCategoriesLoading(false)
        })
      } else {
        setCategoriesLoading(false)
        // Refresh cache in background
        getCategories().then(categoriesData => {
          setCategories(categoriesData)
          categoryCache.set(categoriesData)
        }).catch(() => {
          // Ignore errors for background refresh
        })
      }
      
      const productsResult = await getProducts(filters)
      
      let filteredProducts = productsResult.products
      
      // Apply frontend-only filters
      // Apply featured filter if specified (frontend filter)
      if (featuredFilter) {
        filteredProducts = filteredProducts.filter(p => p.is_featured)
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
      setTotalProducts(productsResult.meta?.total_count || filteredProducts.length)
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


  const clearFilters = () => {
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

  // Helper function to check if a category or its children are selected
  const isCategoryOrChildSelected = (category: Category): boolean => {
    // Check if this category is selected
    if (category.slug === categoryFilter || category.id === categoryFilter) {
      return true
    }
    // Check if any child is selected
    if (category.children) {
      return category.children.some(child => 
        child.slug === categoryFilter || child.id === categoryFilter
      )
    }
    return false
  }

  // Helper function to find parent category of selected category
  const getParentOfSelected = (categories: Category[]): Category | null => {
    for (const cat of categories) {
      if (cat.children) {
        const hasSelectedChild = cat.children.some(child => 
          child.slug === categoryFilter || child.id === categoryFilter
        )
        if (hasSelectedChild) return cat
      }
    }
    return null
  }

  // Get categories for filter sidebar - if we only have one top-level category,
  // show its children instead (like REI does with "Outdoor Gear" -> "Hiking, Camping, etc.")
  const topLevelCategories = categories.filter(cat => !cat.parent_id)
  let displayCategories: Category[] = []
  
  if (topLevelCategories.length === 1 && topLevelCategories[0]?.children?.length) {
    // We have "Outdoor Gear" as the only top-level, so use its children
    const outdoorGear = topLevelCategories[0]
    
    // For each child category, if it has subcategories (like Water Sports -> Rafting, Surfing),
    // use the subcategories instead of the parent
    outdoorGear.children.forEach(category => {
      if (category.children && category.children.length > 0 && 
          (category.slug === 'water-sports' || category.slug === 'winter-sports')) {
        // Add the individual sports instead of the parent category
        displayCategories.push(...category.children)
      } else {
        // Add the category as-is (like Hiking, Camping, etc.)
        displayCategories.push(category)
      }
    })
  } else if (topLevelCategories.length > 0) {
    displayCategories = topLevelCategories
  } else {
    // No categories loaded yet - will show loading state
    displayCategories = []
  }

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
               currentCategory ? (
                 (() => {
                   const parent = getParentOfSelected(categories);
                   return parent ? (
                     <span>
                       {parent.name} 
                       <span className="text-forest-200 mx-2">›</span> 
                       {currentCategory.name}
                     </span>
                   ) : `${currentCategory.name} Collection`
                 })()
               ) : 
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
                    isCategoryOrChildSelected(category)
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Filters Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:w-72 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sand-200 p-8 sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-charcoal-900 tracking-tight uppercase">Refine</h3>
                {(categoryFilter || featuredFilter || minPrice || maxPrice || selectedBrands.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-forest-600 hover:text-forest-700 transition-colors uppercase tracking-wider"
                  >
                    Clear All
                  </button>
                )}
              </div>


              {/* Categories Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Browse by Type</h4>
                {categoriesLoading && categories.length === 0 ? (
                  <CategorySkeleton />
                ) : (
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
                    {displayCategories.map((category) => {
                    // Check if this category has children and shouldn't show the subcategory UI
                    const showSubcategories = category.children && category.children.length > 0 && 
                      category.slug !== 'water-sports' && category.slug !== 'winter-sports'
                    
                    return (
                      <div key={category.id}>
                        <button
                          onClick={() => handleCategoryFilter(category)}
                          className={`w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                            isCategoryOrChildSelected(category)
                              ? 'bg-forest-600 text-white shadow-md transform scale-105'
                              : 'text-charcoal-600 hover:bg-sand-50 border border-sand-200'
                          }`}
                        >
                          {category.name}
                          {showSubcategories && (
                            <svg className="w-4 h-4 inline ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Show subcategories when parent or any child is selected */}
                        {showSubcategories && isCategoryOrChildSelected(category) && (
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
                    )
                  })}
                  </div>
                )}
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
              {(categoryFilter || featuredFilter) && (
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
                categoryFilter 
                  ? `No ${currentCategory?.name.toLowerCase()} gear available yet - check back soon!`
                  : 'No gear available right now - adventure awaits!'
              }
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsFilterOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-forest-600 text-white p-4 rounded-full shadow-lg hover:bg-forest-700 transition-colors z-40 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-semibold">Filter</span>
      </button>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
          
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-sand-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-charcoal-900">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-sand-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Categories Filter */}
              <div className="mb-8">
                <h4 className="text-xs font-black text-charcoal-500 uppercase tracking-wider mb-4">Browse by Type</h4>
                {categoriesLoading && categories.length === 0 ? (
                  <CategorySkeleton />
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleCategoryFilter(null)}
                      className={`w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all ${
                        !categoryFilter 
                          ? 'bg-forest-600 text-white shadow-md' 
                          : 'text-charcoal-600 hover:bg-sand-50 border border-sand-200'
                      }`}
                    >
                      All Gear
                    </button>
                    {displayCategories.map((category) => {
                    // Check if this category has children and shouldn't show the subcategory UI
                    const showSubcategories = category.children && category.children.length > 0 && 
                      category.slug !== 'water-sports' && category.slug !== 'winter-sports'
                    
                    return (
                      <div key={category.id}>
                        <button
                          onClick={() => handleCategoryFilter(category)}
                          className={`w-full text-left px-4 py-3 rounded-full text-sm font-semibold transition-all flex items-center justify-between ${
                            isCategoryOrChildSelected(category)
                              ? 'bg-forest-600 text-white shadow-md'
                              : 'text-charcoal-600 hover:bg-sand-50 border border-sand-200'
                          }`}
                        >
                          <span>{category.name}</span>
                          {showSubcategories && (
                            <svg className={`w-4 h-4 transition-transform ${isCategoryOrChildSelected(category) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                        
                        {/* Show subcategories when parent or any child is selected */}
                        {showSubcategories && isCategoryOrChildSelected(category) && (
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
                    )
                  })}
                  </div>
                )}
              </div>

              {/* Featured Filter */}
              <div className="mb-8">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredFilter}
                    onChange={(e) => {
                      const newParams = new URLSearchParams(searchParams)
                      if (e.target.checked) {
                        newParams.set('featured', 'true')
                      } else {
                        newParams.delete('featured')
                      }
                      setSearchParams(newParams)
                    }}
                    className="w-5 h-5 text-forest-600 border-sand-300 rounded focus:ring-forest-500"
                  />
                  <span className="text-sm font-semibold text-charcoal-700">Featured Items Only</span>
                </label>
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
                      className="w-24 px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                    />
                    <span className="text-charcoal-400">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-24 px-3 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30"
                    />
                  </div>
                  
                  {/* Quick price options */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Under $50', min: '', max: '50' },
                      { label: '$50-$100', min: '50', max: '100' },
                      { label: '$100+', min: '100', max: '' }
                    ].map((range) => (
                      <button
                        key={range.label}
                        onClick={() => {
                          setMinPrice(range.min)
                          setMaxPrice(range.max)
                        }}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                          minPrice === range.min && maxPrice === range.max
                            ? 'bg-forest-600 text-white'
                            : 'bg-sand-100 text-charcoal-600 hover:bg-sand-200'
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Filters Button */}
              <div className="sticky bottom-0 bg-white pt-4 pb-6 -mx-6 px-6 border-t border-sand-200">
                {/* Show active filter count */}
                {(categoryFilter || featuredFilter || minPrice || maxPrice) && (
                  <div className="text-center text-sm text-charcoal-600 mb-3">
                    <span className="font-semibold">
                      {[categoryFilter, featuredFilter, (minPrice || maxPrice)].filter(Boolean).length} filters active
                    </span>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    handlePriceFilter()
                    setIsFilterOpen(false)
                  }}
                  className="w-full bg-forest-600 text-white py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Apply Filters</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                
                {(categoryFilter || featuredFilter || minPrice || maxPrice || selectedBrands.length > 0) && (
                  <button
                    onClick={() => {
                      clearFilters()
                    }}
                    className="w-full mt-2 text-forest-600 py-3 rounded-lg font-semibold hover:bg-sand-50 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}