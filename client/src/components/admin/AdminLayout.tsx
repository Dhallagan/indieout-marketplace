import { ReactNode, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { Link } from 'react-router-dom'
import AdminSidebar from './AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { hasRole, user, logout } = useAuth()
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])
  
  if (!hasRole(UserRole.SYSTEM_ADMIN) && !hasRole(UserRole.SELLER_ADMIN)) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-clay-600 mb-4">Access Denied</h1>
          <p className="text-charcoal-600">You need admin privileges to access this area.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex h-screen bg-sand-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Admin Top Navigation */}
        <header className="bg-forest-700 text-white px-6 py-4 border-b border-forest-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">
                Welcome, {user?.first_name || 'Admin'}!
              </h1>
              <p className="text-sm opacity-75">
                {hasRole(UserRole.SYSTEM_ADMIN) ? 'System Administrator' : 'Seller Dashboard'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Store Link */}
              <Link
                to="/"
                className="text-sm text-sand-200 hover:text-white transition-colors"
              >
                View Store
              </Link>
              
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowUserDropdown(!showUserDropdown)
                  }}
                  className="flex items-center space-x-2 hover:bg-white hover:bg-opacity-10 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-forest-700 font-semibold text-sm bg-sand-200">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <span className="text-sm font-medium">{user?.first_name} {user?.last_name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setShowUserDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}