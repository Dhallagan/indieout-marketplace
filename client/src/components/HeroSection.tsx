import { Link } from 'react-router-dom'
import { HeroContent } from '@/types/hero'

interface HeroSectionProps {
  heroContent?: HeroContent | null
  isPreview?: boolean
}

export default function HeroSection({ heroContent, isPreview = false }: HeroSectionProps) {
  const LinkComponent = isPreview ? 'div' : Link

  return (
    <div 
      className="relative bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 overflow-hidden"
      style={heroContent?.background_image || heroContent?.background_image_hero ? {
        backgroundImage: `url(${heroContent.background_image_hero || heroContent.background_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      {/* Background overlay to ensure text readability */}
      {(heroContent?.background_image || heroContent?.background_image_hero) && (
        <div className="absolute inset-0 bg-gradient-to-br from-forest-900/80 via-forest-800/80 to-forest-700/80"></div>
      )}
      
      {/* Background Pattern - only show if no background image */}
      {!heroContent?.background_image && !heroContent?.background_image_hero && (
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="mountainPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <polygon points="10,2 18,18 2,18" fill="currentColor" opacity="0.3"/>
                <polygon points="5,8 15,8 10,16" fill="currentColor" opacity="0.2"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mountainPattern)"/>
          </svg>
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="text-white space-y-6 lg:space-y-8">
            <div className="inline-flex items-center bg-forest-600/20 backdrop-blur-sm border border-forest-400/30 text-forest-100 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Handcrafted for Adventure
            </div>
            
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight leading-tight">
                {heroContent?.title || (
                  <>
                    Gear Built by <span className="text-forest-300">Adventurers</span>
                  </>
                )}
              </h1>
              {heroContent?.subtitle && (
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-forest-200 mb-4 sm:mb-6">
                  {heroContent.subtitle}
                </h2>
              )}
              <p className="text-base sm:text-lg lg:text-xl text-forest-100 leading-relaxed max-w-xl">
                {heroContent?.description || 'Connect with independent makers creating durable, sustainable outdoor equipment for your next journey into the wild.'}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <LinkComponent
                {...(!isPreview && { to: heroContent?.cta_primary_url || "/shop" })}
                className="bg-white text-forest-900 px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-forest-50 transition-colors text-center inline-block"
              >
                {heroContent?.cta_primary_text || "Explore Marketplace"}
              </LinkComponent>
              <LinkComponent
                {...(!isPreview && { to: heroContent?.cta_secondary_url || "/apply-to-sell" })}
                className="border-2 border-white text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-semibold hover:bg-white hover:text-forest-900 transition-colors text-center inline-block"
              >
                {heroContent?.cta_secondary_text || "Start Selling"}
              </LinkComponent>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center sm:justify-start space-x-6 sm:space-x-8 pt-2 sm:pt-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">500+</div>
                <div className="text-xs sm:text-sm text-forest-200">Makers</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">10K+</div>
                <div className="text-xs sm:text-sm text-forest-200">Products</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-white">4.9★</div>
                <div className="text-xs sm:text-sm text-forest-200">Rating</div>
              </div>
            </div>
          </div>
          
          <div className="relative hidden lg:block">
            <div 
              className="h-96 bg-gradient-to-br from-forest-600 to-forest-800 rounded-2xl relative overflow-hidden shadow-2xl"
              style={heroContent?.featured_collection_image ? {
                backgroundImage: `url(${heroContent.featured_collection_image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : {}}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              <div className="absolute top-6 left-6">
                <span className="bg-white/90 text-forest-800 text-sm px-3 py-1 rounded-full font-semibold">
                  {heroContent?.featured_collection_title || 'FEATURED COLLECTION'}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">
                  {heroContent?.featured_collection_subtitle || 'Essential Trail Gear'}
                </h3>
                <LinkComponent 
                  {...(!isPreview && { to: "/shop?featured=true" })}
                  className="inline-flex items-center text-white hover:text-forest-200 transition-colors font-medium cursor-pointer"
                >
                  Explore Collection
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </LinkComponent>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}