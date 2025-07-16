const API_BASE_URL = import.meta.env.VITE_API_URL || ''

// Helper function to make authenticated API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`)
  }
  
  return response.json()
}

// Dashboard Stats
export interface DashboardStats {
  total_users: number
  total_sellers: number
  pending_sellers: number
  verified_sellers: number
  total_products: number
  total_orders: number
  revenue_total: number
  revenue_this_month: number
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiCall('/api/v1/admin/dashboard/stats')
  return response.data.stats
}

// Seller Management
export interface AdminSeller {
  id: string
  user_id: string
  name: string
  slug: string
  description: string
  email: string
  phone: string
  website: string
  is_verified: boolean
  is_active: boolean
  verification_status: 'pending' | 'verified' | 'rejected'
  total_products: number
  total_sales: number
  created_at: string
  updated_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
}

export const getAllSellers = async (): Promise<AdminSeller[]> => {
  const response = await apiCall('/api/v1/admin/sellers')
  return response.data.sellers
}

export const approveSeller = async (sellerId: string): Promise<AdminSeller> => {
  const response = await apiCall(`/api/v1/admin/sellers/${sellerId}/approve`, {
    method: 'PATCH'
  })
  return response.data.seller
}

export const rejectSeller = async (sellerId: string, reason?: string): Promise<AdminSeller> => {
  const response = await apiCall(`/api/v1/admin/sellers/${sellerId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  })
  return response.data.seller
}

export const toggleSellerStatus = async (sellerId: string): Promise<AdminSeller> => {
  const response = await apiCall(`/api/v1/admin/sellers/${sellerId}/toggle-status`, {
    method: 'PATCH'
  })
  return response.data.seller
}

// User Management
export interface AdminUser {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  email_verified_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  store?: {
    id: string
    name: string
    is_verified: boolean
  }
}

export const getAllUsers = async (): Promise<AdminUser[]> => {
  const response = await apiCall('/api/v1/admin/users')
  return response.data.users
}

export const toggleUserStatus = async (userId: string): Promise<AdminUser> => {
  const response = await apiCall(`/api/v1/admin/users/${userId}/toggle-status`, {
    method: 'PATCH'
  })
  return response.data.user
}

export const changeUserRole = async (userId: string, role: string): Promise<AdminUser> => {
  const response = await apiCall(`/api/v1/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role })
  })
  return response.data.user
}

// Product Management
export interface AdminProduct {
  id: string
  name: string
  slug: string
  price: number
  inventory: number
  status: string
  is_featured: boolean
  created_at: string
  store: {
    id: string
    name: string
    is_verified: boolean
  }
  category: {
    id: string
    name: string
  }
}

export const getAllProducts = async (): Promise<AdminProduct[]> => {
  const response = await apiCall('/api/v1/admin/products')
  return response.data.products
}

export const toggleProductFeatured = async (productId: string): Promise<AdminProduct> => {
  const response = await apiCall(`/api/v1/admin/products/${productId}/toggle-featured`, {
    method: 'PATCH'
  })
  return response.data.product
}

export const updateProductStatus = async (productId: string, status: string): Promise<AdminProduct> => {
  const response = await apiCall(`/api/v1/admin/products/${productId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  })
  return response.data.product
}