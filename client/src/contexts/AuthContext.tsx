import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, UserRole } from '@/types/auth'
import * as authService from '@/services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setAuthData: (token: string, user: User) => void
  isAuthenticated: boolean
  hasRole: (role: UserRole) => boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { user, token } = await authService.login(email, password)
    localStorage.setItem('token', token)
    setUser(user)
  }

  const register = async (data: RegisterData) => {
    const { user, token } = await authService.register(data)
    localStorage.setItem('token', token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const setAuthData = (token: string, user: User) => {
    localStorage.setItem('token', token)
    setUser(user)
  }

  const hasRole = (role: UserRole) => user?.role === role

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    setAuthData,
    isAuthenticated: !!user,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}