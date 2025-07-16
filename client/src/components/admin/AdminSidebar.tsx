import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'

interface NavigationItem {
  label: string
  url: string
  icon: React.ReactNode
  matches?: string[]
  roles?: UserRole[]
}

export default function AdminSidebar() {
  const location = useLocation()
  const { hasRole, user } = useAuth()
  
  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      url: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      )
    },
    {
      label: 'Categories',
      url: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      roles: [UserRole.SYSTEM_ADMIN]
    },
    {
      label: 'Hero Content',
      url: '/admin/hero',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      roles: [UserRole.SYSTEM_ADMIN]
    },
    {
      label: 'Products',
      url: '/seller/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: [UserRole.SELLER_ADMIN]
    },
    {
      label: 'Orders',
      url: '/seller/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      roles: [UserRole.SELLER_ADMIN]
    },
    {
      label: 'Orders',
      url: '/admin/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      roles: [UserRole.SYSTEM_ADMIN]
    },
    {
      label: 'Sellers',
      url: '/admin/sellers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      roles: [UserRole.SYSTEM_ADMIN]
    },
    {
      label: 'Analytics',
      url: '/admin/analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      roles: [UserRole.SYSTEM_ADMIN]
    },
    {
      label: 'Settings',
      url: '/seller/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      roles: [UserRole.SELLER_ADMIN]
    }
  ]
  
  const isActive = (item: NavigationItem) => {
    if (item.matches) {
      return item.matches.some(match => location.pathname.startsWith(match))
    }
    return location.pathname === item.url
  }
  
  const canAccess = (item: NavigationItem) => {
    if (!item.roles) return true
    return item.roles.some(role => hasRole(role))
  }
  
  return (
    <div className="w-56 bg-forest-800 text-white flex flex-col h-screen">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-forest-700">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sand-200">
            <span className="text-forest-700 font-bold text-sm">IO</span>
          </div>
          <span className="font-semibold text-lg">
            IndieOut {hasRole(UserRole.SYSTEM_ADMIN) && (
              <span className="text-xs text-sand-300 ml-1">Admin</span>
            )}
          </span>
        </Link>
      </div>
      
      {/* User Info */}
      <div className="p-4 border-b border-forest-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-sand-200 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-forest-700">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-sand-300 truncate">
              {hasRole(UserRole.SYSTEM_ADMIN) && 'System Admin'}
              {hasRole(UserRole.SELLER_ADMIN) && 'Seller'}
              {hasRole(UserRole.CONSUMER) && 'Customer'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems
          .filter(canAccess)
          .map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive(item)
                  ? 'bg-forest-600 text-white' 
                  : 'text-sand-200 hover:bg-forest-700 hover:text-white'
                }
              `.trim()}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))
        }
      </nav>
      
      {/* Bottom Actions */}
      <div className="p-4 border-t border-forest-700">
        <Link
          to="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-sand-200 hover:bg-forest-700 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>View Marketplace</span>
        </Link>
      </div>
    </div>
  )
}