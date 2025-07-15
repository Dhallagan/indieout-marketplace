import { ReactNode, useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/contexts/CartContext'
import { UserRole } from '@/types/auth'
import { getCategories } from '@/services/categoryService'
import { getProducts } from '@/services/productService'
import { Category, Product } from '@/types/api-generated'
import { getProductImageUrl } from '@/utils/imageHelpers'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated, hasRole } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  // Get display categories (same logic as ShopPage)
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
  } else {
    displayCategories = topLevelCategories
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchDropdown(false)
      setSearchQuery('')
    }
  }

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    // Don't search for very short queries
    if (value.trim().length < 2) {
      setSearchResults([])
      setShowSearchDropdown(false)
      return
    }
    
    // Debounce search - wait 300ms after user stops typing
    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await getProducts({
          search: value.trim(),
          per_page: 5 // Only show top 5 results in dropdown
        })
        setSearchResults(result.products)
        setShowSearchDropdown(result.products.length > 0)
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setShowUserDropdown(false)
      
      // Close search dropdown if clicked outside
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-sand-50">
      <nav className="bg-white/95 backdrop-blur-sm border-b border-sand-200 relative z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center space-x-4 lg:space-x-12">
              {/* Mobile Menu Button - Left side on mobile */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-md text-charcoal-700 hover:text-forest-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <img 
                  src="/logo.png" 
                  alt="IndieOut" 
                  className="h-10 w-auto group-hover:scale-105 transition-transform duration-200"
                />
                <span className="text-xl sm:text-2xl font-black text-forest-700 tracking-tight group-hover:text-forest-800 transition-colors">
                  IndieOut
                </span>
              </Link>
              
              {/* Main Navigation Links */}
              <div className="hidden lg:flex items-center space-x-8">
                <Link
                  to="/shop"
                  className="text-sm font-semibold text-charcoal-700 hover:text-forest-600 transition-colors"
                >
                  Shop
                </Link>
                <Link
                  to="/shop?featured=true"
                  className="text-sm font-semibold text-charcoal-700 hover:text-forest-600 transition-colors"
                >
                  ✨ Featured
                </Link>
                <Link
                  to="/brands"
                  className="text-sm font-semibold text-charcoal-700 hover:text-forest-600 transition-colors"
                >
                  Brands
                </Link>
              </div>
            </div>

            <div className="flex items-center flex-1 space-x-4 lg:space-x-6">
              {/* Search Bar */}
              <div className="hidden lg:block relative flex-1 max-w-2xl mx-8" ref={searchRef}>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearchDropdown(true)}
                    placeholder="Find your gear..."
                    className="w-full px-4 py-2.5 pl-10 pr-4 text-sm text-charcoal-800 bg-sand-25 border border-sand-300 rounded-full focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400 transition-all placeholder:text-charcoal-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-charcoal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('')
                        setShowSearchDropdown(false)
                        setSearchResults([])
                      }}
                      className="absolute inset-y-0 right-2 flex items-center text-charcoal-400 hover:text-charcoal-600 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </form>
                
                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-sand-200 overflow-hidden">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forest-600 mx-auto"></div>
                      </div>
                    ) : (
                      <>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/shop/products/${product.slug}`}
                            className="block px-4 py-3 hover:bg-sand-50 transition-colors border-b border-sand-100 last:border-b-0"
                            onClick={() => {
                              setShowSearchDropdown(false)
                              setSearchQuery('')
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <img
                                src={getProductImageUrl(product.primary_image || product.images?.[0])}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder-product.svg'
                                }}
                              />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-charcoal-900">{product.name}</h4>
                                <p className="text-xs text-charcoal-600">${product.base_price}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                        <Link
                          to={`/search?q=${encodeURIComponent(searchQuery)}`}
                          className="block px-4 py-3 bg-forest-50 hover:bg-forest-100 text-center text-sm font-medium text-forest-700 transition-colors"
                          onClick={() => {
                            setShowSearchDropdown(false)
                            setSearchQuery('')
                          }}
                        >
                          View all results for "{searchQuery}"
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Desktop Navigation Actions */}
              <div className="hidden md:flex items-center space-x-4">
                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="relative p-2 text-charcoal-600 hover:text-forest-600 transition-colors group"
                  title="Wishlist"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                {/* Shopping Cart */}
                <Link
                  to="/cart"
                  className="relative p-2 text-charcoal-600 hover:text-forest-600 transition-colors group"
                  title="Shopping Cart"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m6.5-6h3" />
                  </svg>
                  {/* Cart badge */}
                  {cart && cart.total_items > 0 && (
                    <span className="absolute -top-1 -right-1 bg-clay-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold shadow-sm">
                      {cart.total_items > 99 ? '99+' : cart.total_items}
                    </span>
                  )}
                </Link>

                {/* User Account */}
                {isAuthenticated ? (
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowUserDropdown(!showUserDropdown)
                      }}
                      className="flex items-center space-x-2 text-charcoal-700 hover:text-forest-600 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-white">
                          {user?.first_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <svg className="w-4 h-4 text-charcoal-500 group-hover:text-charcoal-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* User Dropdown */}
                    {showUserDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-lg border border-charcoal-200 py-2 z-[9999]">
                        <div className="px-4 py-2 border-b border-charcoal-200">
                          <div className="text-sm font-medium text-charcoal-900">{user?.first_name} {user?.last_name}</div>
                          <div className="text-xs text-charcoal-500">{user?.email}</div>
                        </div>
                        
                        {/* Customer Functions */}
                        <div className="px-4 py-2">
                          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                            {hasRole(UserRole.SELLER_ADMIN) ? 'Personal' : 'Shopping'}
                          </div>
                          <Link
                            to="/dashboard?tab=purchases"
                            className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-sand-50 rounded-md"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            My Orders
                          </Link>
                          <Link
                            to="/wishlist"
                            className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-sand-50 rounded-md"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            Wishlist
                          </Link>
                        </div>
                        
                        {/* Seller Functions */}
                        {hasRole(UserRole.SELLER_ADMIN) ? (
                          <div className="px-4 py-2 border-t border-charcoal-200">
                            <Link
                              to="/seller/dashboard"
                              className="block px-3 py-2 text-sm text-forest-600 hover:bg-forest-50 rounded-md font-medium"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              🏪 Go to My Store
                            </Link>
                          </div>
                        ) : (
                          <div className="px-4 py-2 border-t border-charcoal-200">
                            <Link
                              to="/apply-to-sell"
                              className="block px-3 py-2 text-sm text-forest-600 hover:bg-forest-50 rounded-md font-medium"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              ⚡ Start Selling
                            </Link>
                          </div>
                        )}
                        
                        {/* Admin Functions */}
                        {hasRole(UserRole.SYSTEM_ADMIN) && (
                          <div className="px-4 py-2 border-t border-charcoal-200">
                            <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                              Admin
                            </div>
                            <Link
                              to="/admin/categories"
                              className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-sand-50 rounded-md"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              Manage Categories
                            </Link>
                            <Link
                              to="/admin/banners"
                              className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-sand-50 rounded-md"
                              onClick={() => setShowUserDropdown(false)}
                            >
                              Manage Banners
                            </Link>
                          </div>
                        )}
                        
                        {/* Account Settings */}
                        <div className="px-4 py-2 border-t border-charcoal-200">
                          <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                            Account
                          </div>
                          <Link
                            to="/profile"
                            className="block px-3 py-2 text-sm text-charcoal-700 hover:bg-sand-50 rounded-md"
                            onClick={() => setShowUserDropdown(false)}
                          >
                            Profile Settings
                          </Link>
                        </div>
                        
                        <div className="border-t border-charcoal-200 mt-2">
                          <button
                            onClick={() => {
                              logout()
                              setShowUserDropdown(false)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-charcoal-700 hover:bg-sand-50"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="bg-forest-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-forest-700 transition-colors shadow-sm"
                  >
                    Sign In
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-charcoal-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-3">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search gear..."
                    className="w-full pl-10 pr-4 py-2 border border-sand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30 focus:border-forest-400"
                  />
                  <svg className="absolute left-3 top-2.5 w-5 h-5 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </form>
              </div>
              
              <Link
                to="/shop"
                className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-forest-600 hover:bg-sand-50"
                onClick={() => setShowMobileMenu(false)}
              >
                Shop All
              </Link>
              <Link
                to="/shop?featured=true"
                className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-forest-600 hover:bg-sand-50"
                onClick={() => setShowMobileMenu(false)}
              >
                Featured
              </Link>
              
              {/* Categories */}
              <div className="px-3 py-2">
                <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
                  Categories
                </div>
                {displayCategories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.slug || category.id}`}
                    className="block px-3 py-2 rounded-md text-sm text-charcoal-600 hover:text-forest-600 hover:bg-sand-50"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              {/* Account Actions */}
              <div className="border-t border-charcoal-200 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 text-sm text-charcoal-500">
                      Welcome, {user?.first_name}
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-forest-600 hover:bg-sand-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout()
                        setShowMobileMenu(false)
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-forest-600 hover:bg-sand-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/apply-to-sell"
                      className="block px-3 py-2 rounded-md text-base font-medium text-forest-600 hover:text-forest-700 hover:bg-sand-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Apply to Sell
                    </Link>
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-charcoal-700 hover:text-forest-600 hover:bg-sand-50"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium bg-forest-600 text-white hover:bg-forest-700"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Secondary Navigation - Categories */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
              <Link
                to="/shop"
                className="text-sm font-medium text-charcoal-600 hover:text-forest-600 whitespace-nowrap transition-colors"
              >
                All Gear
              </Link>
              <Link
                to="/shop?featured=true"
                className="text-sm font-medium text-forest-600 hover:text-forest-700 whitespace-nowrap transition-colors"
              >
                ✨ Featured
              </Link>
              {displayCategories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  to={`/shop?category=${category.slug || category.id}`}
                  className="text-sm font-medium text-charcoal-600 hover:text-forest-600 whitespace-nowrap transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              
              {displayCategories.length > 5 && (
                <Link
                  to="/shop"
                  className="text-sm font-medium text-charcoal-500 hover:text-forest-600 whitespace-nowrap transition-colors"
                >
                  More Categories
                </Link>
              )}
            </div>
            
            {/* Right side info */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/track-order"
                className="text-xs text-charcoal-500 hover:text-forest-600 transition-colors"
              >
                Track Order
              </Link>
              <div className="text-xs text-charcoal-500 bg-sand-50 px-3 py-1.5 rounded-full flex items-center space-x-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-3 1m3-1l-3-1m3 1H6m6-5V3a2 2 0 00-2-2H4a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1" />
                </svg>
                <span>Free shipping over $100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>{children}</main>
    </div>
  )
}