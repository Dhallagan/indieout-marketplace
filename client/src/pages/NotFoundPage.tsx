import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export default function NotFoundPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Hero Section with Forest Theme */}
      <div className="relative bg-gradient-to-b from-forest-800 via-forest-700 to-forest-600 overflow-hidden">
        {/* Mountain Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="lostPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <polygon points="15,5 25,25 5,25" fill="currentColor" opacity="0.3"/>
                <polygon points="20,15 30,30 10,30" fill="currentColor" opacity="0.2"/>
                <polygon points="10,20 18,30 2,30" fill="currentColor" opacity="0.4"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#lostPattern)"/>
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-24 text-center">
          <div className="relative inline-block">
            <h1 className="text-[10rem] md:text-[14rem] font-black text-white/20 leading-none select-none tracking-tighter">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 border border-white/20">
                <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
            </div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black text-white mt-8 mb-4 tracking-tight">
            Trail Not Found
          </h2>
          <p className="text-xl text-forest-100 max-w-2xl mx-auto mb-12">
            Looks like you've ventured off the beaten path. This trail doesn't exist on our map, 
            but we can help you find your way back to basecamp.
          </p>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-white text-forest-800 font-bold text-lg hover:bg-sand-100 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Basecamp
            </Link>
            
            <Link 
              to="/shop" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-white/20 backdrop-blur-sm text-white font-bold text-lg border-2 border-white/30 hover:bg-white/30 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Explore Gear
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sand-200 p-12">
          <h3 className="text-2xl font-black text-charcoal-900 mb-8 text-center">Popular Destinations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/shop" className="group">
              <div className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:border-forest-300 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-forest-200 transition-colors">
                  <svg className="w-6 h-6 text-forest-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h4 className="font-bold text-charcoal-900 mb-2">All Gear</h4>
                <p className="text-charcoal-600 text-sm">Browse our complete collection of outdoor equipment</p>
              </div>
            </Link>
            
            {user ? (
              <Link to={user.role === 'system_admin' ? '/dashboard' : user.role === 'seller_admin' ? '/seller/dashboard' : '/shop'} className="group">
                <div className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:border-forest-300 transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-forest-200 transition-colors">
                    <svg className="w-6 h-6 text-forest-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-charcoal-900 mb-2">Your Dashboard</h4>
                  <p className="text-charcoal-600 text-sm">Manage your account and activities</p>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="group">
                <div className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:border-forest-300 transition-all hover:shadow-md">
                  <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-forest-200 transition-colors">
                    <svg className="w-6 h-6 text-forest-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-charcoal-900 mb-2">Sign In</h4>
                  <p className="text-charcoal-600 text-sm">Access your account and saved items</p>
                </div>
              </Link>
            )}
            
            <Link to="/apply-to-sell" className="group">
              <div className="bg-sand-50 rounded-xl p-6 border border-sand-200 hover:border-forest-300 transition-all hover:shadow-md">
                <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-forest-200 transition-colors">
                  <svg className="w-6 h-6 text-forest-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h4 className="font-bold text-charcoal-900 mb-2">Sell Your Gear</h4>
                <p className="text-charcoal-600 text-sm">Join our community of outdoor creators</p>
              </div>
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <p className="text-charcoal-600">
              Need assistance? 
              <Link to="/contact" className="ml-2 text-forest-600 hover:text-forest-700 font-semibold hover:underline">
                Contact our trail guides
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}