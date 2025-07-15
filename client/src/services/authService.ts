import { AuthResponse, User, UserRole } from '@/types/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

class AuthService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Login failed')
    }

    return data.data
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return data.data
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get user data')
    }

    return data.data.user
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Email verification failed')
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Password reset request failed')
    }
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Password reset failed')
    }
  }

  async becomeSeller(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/become_seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upgrade to seller')
    }

    return data.data.user
  }
}

const authService = new AuthService()

export const login = (email: string, password: string) => authService.login(email, password)
export const register = (userData: RegisterData) => authService.register(userData)
export const getCurrentUser = () => authService.getCurrentUser()
export const verifyEmail = (token: string) => authService.verifyEmail(token)
export const forgotPassword = (email: string) => authService.forgotPassword(email)
export const resetPassword = (token: string, password: string) => authService.resetPassword(token, password)
export const becomeSeller = () => authService.becomeSeller()

export type { RegisterData }