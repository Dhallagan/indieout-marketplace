import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ProductGrid from '@/components/ProductGrid'
import CategoryIcon from '@/components/CategoryIcon'
import HeroSection from '@/components/HeroSection'
import { useCategories } from '@/contexts/CategoryContext'
import { getProducts } from '@/services/productService'
import { getCurrentHeroContent } from '@/services/heroService'
import { getPublicStores } from '@/services/storeService'
import { Category, Product, Store } from '@/types/api-generated'
import { HeroContent } from '@/types/hero'

export default function HomePage() {
  const { categories } = useCategories()
  const [stores, setStores] = useState<Store[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stores and products in parallel (categories from context)
        const [storesData, productsResult] = await Promise.all([
          getPublicStores(),
          getProducts()
        ])
        
        // Load hero content separately to handle errors gracefully
        try {
          const heroData = await getCurrentHeroContent()
          console.log('Hero content loaded:', heroData) // Debug log
          console.log('Featured collection image URL:', heroData.featured_collection_image) // Debug image URL
          setHeroContent(heroData)
        } catch (error) {
          console.error('Failed to load hero content:', error)
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            error
          })
          // Use fallback hero content
          setHeroContent({
            title: "Handcrafted gear for trail-worthy adventures",
            description: "Connect with independent sellers creating durable, sustainable outdoor equipment for your next journey.",
            cta_primary_text: "Explore the marketplace",
            cta_primary_url: "/shop",
            cta_secondary_text: "Start selling your gear",
            cta_secondary_url: "/apply-to-sell",
            featured_collection_title: "FEATURED COLLECTION",
            featured_collection_subtitle: "Desert Trail Essentials"
          })
        }
        
        // Categories are now loaded from context
        setStores(storesData)
        
        // Filter featured products
        const featured = productsResult.products.filter(product => product.is_featured)
        setFeaturedProducts(featured.slice(0, 8)) // Show max 8 featured products
        
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
        setIsLoadingProducts(false)
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Hero Section */}
      <HeroSection heroContent={heroContent} />

      {/* Featured Brands */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-forest-100 text-forest-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Featured Brands
          </div>
          <h2 className="text-4xl font-bold text-charcoal-900 mb-4">Discover Independent Makers</h2>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            Shop directly from passionate outdoor brands crafting gear with purpose, quality, and adventure in mind.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-card animate-pulse">
                <div className="h-32 bg-sand-200 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-6 bg-sand-200 rounded mb-2"></div>
                  <div className="h-4 bg-sand-200 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : stores.length > 0 ? (
            stores.slice(0, 8).map((store) => (
              <Link
                key={store.id}
                to={`/shop/stores/${store.slug}`}
                className="group bg-white rounded-xl shadow-card border border-sand-200 hover:shadow-hover hover:border-forest-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Future Image Placeholder */}
                <div className="aspect-square bg-sand-50 flex items-center justify-center">
                  <div className="text-6xl font-black text-sand-200">
                    {store.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                </div>
                
                {/* Brand Name */}
                <div className="p-6 text-center">
                  <h3 className="font-bold text-charcoal-900 text-lg group-hover:text-forest-700 transition-colors">
                    {store.name}
                  </h3>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-charcoal-600">No brands available yet. Check back soon!</p>
            </div>
          )}
        </div>
        
        {stores.length > 8 && (
          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 border-2 border-forest-600 text-forest-600 font-semibold rounded-lg hover:bg-forest-600 hover:text-white transition-colors"
            >
              View All Brands
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Brand Showcase Section */}
      <div className="relative bg-gradient-to-b from-sand-25 via-white to-sand-50 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="brandPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="currentColor" opacity="0.3"/>
                <circle cx="10" cy="10" r="0.5" fill="currentColor" opacity="0.2"/>
                <circle cx="30" cy="30" r="0.8" fill="currentColor" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#brandPattern)"/>
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-forest-100 text-forest-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Maker Spotlight
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-charcoal-900 mb-6 tracking-tight">
              Stories Behind the Gear
            </h2>
            <p className="text-xl text-charcoal-600 max-w-3xl mx-auto leading-relaxed">
              Every piece of gear has a story. Meet the passionate creators, adventurers, and craftspeople who pour their expertise into equipment that stands up to your wildest adventures.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Featured Story - Large Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-2xl border border-sand-200 overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="relative h-80 lg:h-96">
                  <img 
                    src="https://picsum.photos/600/400?grayscale&mountain" 
                    alt="Sarah Chen in her workshop"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/50 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <span className="text-sm font-bold uppercase tracking-wider bg-forest-600 px-3 py-1 rounded-full">Featured Maker</span>
                    <h3 className="text-2xl font-black mt-3">Sarah Chen</h3>
                    <p className="text-sm opacity-90">Founder, Peak Forge Co.</p>
                  </div>
                </div>
                
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <blockquote className="text-lg text-charcoal-700 mb-6 leading-relaxed italic">
                    "After losing my favorite carabiner on a climb in Yosemite, I decided to forge my own. Six years later, Peak Forge has equipped over 10,000 climbers with gear they can trust their lives with."
                  </blockquote>
                  
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-forest-400 to-forest-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold">PF</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-charcoal-900">Peak Forge Co.</h4>
                      <div className="flex items-center text-sm text-charcoal-600">
                        <svg className="w-4 h-4 text-forest-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified • Boulder, CO • Since 2018
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-sand-50 rounded-lg p-3">
                      <div className="text-xl font-black text-forest-600">10K+</div>
                      <div className="text-xs text-charcoal-600 font-medium">Climbers Equipped</div>
                    </div>
                    <div className="bg-sand-50 rounded-lg p-3">
                      <div className="text-xl font-black text-forest-600">47</div>
                      <div className="text-xs text-charcoal-600 font-medium">Products</div>
                    </div>
                    <div className="bg-sand-50 rounded-lg p-3">
                      <div className="text-xl font-black text-forest-600">4.9★</div>
                      <div className="text-xs text-charcoal-600 font-medium">Rating</div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/shop/stores/peak-forge-co" 
                    className="bg-forest-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-all duration-200 text-center transform hover:scale-105 shadow-lg"
                  >
                    Explore Peak Forge →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand Card 1 */}
            <div className="group bg-white rounded-xl shadow-lg border border-sand-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-48 bg-gradient-to-br from-terra-600 to-terra-800 overflow-hidden">
                <img 
                  src="https://picsum.photos/400/200?grayscale&forest" 
                  alt="Wildland Threads sustainable workshop"
                  className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-terra-900/70 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">🌱 Eco-Friendly</span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                    <span className="text-white font-bold">WT</span>
                  </div>
                  <h3 className="text-lg font-black">Wildland Threads</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-forest-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-forest-600 font-medium">Verified</span>
                  </div>
                  <span className="text-xs text-charcoal-500 font-medium">📍 Portland, OR</span>
                </div>
                
                <p className="text-sm text-charcoal-600 mb-4 leading-relaxed">
                  <strong>"From ocean plastic to trail-ready apparel."</strong> Transforming waste into premium outdoor clothing that protects both you and the planet.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-charcoal-500">
                    <span className="font-bold text-green-600">100% Recycled Materials</span>
                  </div>
                  <Link 
                    to="/shop/stores/wildland-threads" 
                    className="bg-terra-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-terra-700 transition-colors"
                  >
                    Shop Sustainably
                  </Link>
                </div>
              </div>
            </div>

            {/* Brand Card 2 */}
            <div className="group bg-white rounded-xl shadow-lg border border-sand-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-48 bg-gradient-to-br from-clay-600 to-clay-800 overflow-hidden">
                <img 
                  src="https://picsum.photos/400/200?grayscale&camp" 
                  alt="Trail Craft traditional workshop"
                  className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-clay-900/70 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold">🏆 Heritage Craft</span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm">
                    <span className="text-white font-bold">TC</span>
                  </div>
                  <h3 className="text-lg font-black">Trail Craft</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-forest-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-forest-600 font-medium">Verified</span>
                  </div>
                  <span className="text-xs text-charcoal-500 font-medium">📍 Moab, UT</span>
                </div>
                
                <p className="text-sm text-charcoal-600 mb-4 leading-relaxed">
                  <strong>"Three generations of wilderness wisdom."</strong> Hand-forged camping gear using techniques passed down through generations of outdoor enthusiasts.
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-charcoal-500">
                    <span className="font-bold text-amber-600">Lifetime Guarantee</span>
                  </div>
                  <Link 
                    to="/shop/stores/trail-craft" 
                    className="bg-clay-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-clay-700 transition-colors"
                  >
                    View Heritage
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-sand-200 max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-charcoal-900 mb-3">Ready to Share Your Story?</h3>
              <p className="text-charcoal-600 mb-6">Join our community of passionate makers and connect with adventurers who value authentic, quality gear.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/apply-to-sell" 
                  className="bg-forest-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors"
                >
                  Become a Maker
                </Link>
                <Link 
                  to="/shop" 
                  className="border border-forest-600 text-forest-600 px-6 py-3 rounded-lg font-semibold hover:bg-forest-50 transition-colors"
                >
                  Explore All Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <div className="inline-flex items-center bg-forest-100 text-forest-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
            </svg>
            Editor's Choice
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-charcoal-900 mb-3 sm:mb-4">Trail-Tested Favorites</h2>
          <p className="text-base sm:text-lg lg:text-xl text-charcoal-600 max-w-3xl mx-auto mb-6 sm:mb-8">
            Gear that's earned its place in adventurers' packs through real-world testing in demanding conditions.
          </p>
          <Link 
            to="/shop?featured=true"
            className="inline-flex items-center bg-forest-600 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors text-sm sm:text-base"
          >
            View All Featured Gear
            <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <ProductGrid 
          products={featuredProducts}
          isLoading={isLoadingProducts}
          columns={4}
          showStore={true}
          emptyMessage="No featured products available yet. Check back soon for curated gear recommendations!"
        />
      </div>

      {/* Newsletter & Community */}
      <div className="bg-gradient-to-r from-forest-600 via-forest-700 to-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 sm:mb-4">
                Join the Adventure Community
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-forest-100 mb-6 sm:mb-8 leading-relaxed">
                Get exclusive access to new gear drops, maker stories, and adventure tips from our community of passionate outdoor enthusiasts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-charcoal-900 placeholder-charcoal-500 focus:outline-none focus:ring-2 focus:ring-white text-base"
                />
                <button className="bg-white text-forest-700 px-6 py-3 rounded-lg font-semibold hover:bg-forest-50 transition-colors">
                  Join Community
                </button>
              </div>
              
              <div className="flex items-center space-x-6 text-forest-100">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Weekly gear drops
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Exclusive discounts
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Adventure tips
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="text-3xl font-black mb-2">25K+</div>
                <div className="text-sm font-medium text-forest-100">Community Members</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="text-3xl font-black mb-2">500+</div>
                <div className="text-sm font-medium text-forest-100">Verified Makers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="text-3xl font-black mb-2">15K+</div>
                <div className="text-sm font-medium text-forest-100">Products Tested</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center text-white">
                <div className="text-3xl font-black mb-2">4.9★</div>
                <div className="text-sm font-medium text-forest-100">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}