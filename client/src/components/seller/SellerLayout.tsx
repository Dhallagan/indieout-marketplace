import { ReactNode, useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'

interface SellerLayoutProps {
  children: ReactNode
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  const { user, logout, hasRole } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  if (!hasRole(UserRole.SELLER_ADMIN)) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Access Denied</h1>
          <p className="text-charcoal-600">You need seller privileges to access this area.</p>
          <Link to="/shop" className="mt-4 inline-block bg-forest-600 text-white px-6 py-3 rounded-lg hover:bg-forest-700 transition-colors">
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: 'home' },
    { name: 'Products', href: '/seller/products', icon: 'package' },
    { name: 'Orders', href: '/seller/orders', icon: 'clipboard' },
    { name: 'Settings', href: '/seller/settings', icon: 'settings' },
  ]

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      case 'package':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      case 'clipboard':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      case 'chart':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      case 'settings':
        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      default:
        return null
    }
  }

  const isActive = (href: string) => location.pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-sand-50 flex">
      {/* Sidebar Navigation */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-sand-200/80 shadow-sm">
        {/* Logo and Store Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sand-200/60">
          <Link to="/shop" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="IndieOut" 
              className="h-7 w-auto"
            />
            <span className="text-sm font-bold text-charcoal-800">IndieOut</span>
          </Link>
        </div>

        {/* Store Info */}
        <div className="px-6 py-4 border-b border-sand-200/60 bg-sand-25">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-charcoal-800 truncate">
                {user?.store?.name || 'My Store'}
              </p>
              <p className="text-xs text-charcoal-500">Seller Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-forest-100/80 text-forest-800 shadow-sm border border-forest-200/50' 
                    : 'text-charcoal-600 hover:text-forest-700 hover:bg-forest-50/50'
                }`}
              >
                <span className={active ? 'text-forest-600' : 'text-charcoal-400'}>
                  {getIcon(item.icon)}
                </span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-sand-200/60 px-4 py-4 space-y-2">
          <Link
            to="/shop"
            className="flex items-center space-x-3 px-4 py-2.5 text-sm text-charcoal-600 hover:text-forest-600 hover:bg-forest-50/50 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View Storefront</span>
          </Link>
          
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-charcoal-600 hover:bg-sand-50/80 rounded-xl transition-colors"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-charcoal-500 to-charcoal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <span className="flex-1 text-left truncate">{user?.first_name} {user?.last_name}</span>
              <svg className="w-4 h-4 text-charcoal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showUserMenu && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white shadow-xl rounded-xl border border-sand-200/60 py-2 z-50 backdrop-blur-sm">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-sand-50/80 transition-colors duration-200 rounded-lg mx-2"
                >
                  Personal Account
                </Link>
                
                <Link
                  to="/seller/settings"
                  className="block px-4 py-2.5 text-sm text-charcoal-700 hover:bg-sand-50/80 transition-colors duration-200 rounded-lg mx-2"
                >
                  Store Settings
                </Link>
                
                <div className="border-t border-sand-200/60 mt-2 pt-2">
                  <button
                    onClick={() => {
                      logout()
                      setShowUserMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-charcoal-700 hover:bg-sand-50/80 transition-colors duration-200 rounded-lg mx-2"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-sm border-b border-sand-200/80 sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-charcoal-900">Welcome back, {user?.first_name}!</h1>
                <p className="text-sm text-charcoal-600">Manage your outdoor gear store</p>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                {/* Quick actions can be added here per page */}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}