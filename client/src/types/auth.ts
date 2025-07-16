export enum UserRole {
  CONSUMER = 'consumer',
  SELLER_ADMIN = 'seller_admin',
  SYSTEM_ADMIN = 'system_admin',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  emailVerified: boolean
  avatar?: string
  phone?: string
  createdAt: string
  updatedAt: string
  store?: {
    id: string
    name: string
    slug: string
    isVerified: boolean
    isActive: boolean
  }
  is_impersonating?: boolean
  impersonator_id?: string
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
}