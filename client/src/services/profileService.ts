import { User } from '@/types/api-generated'

const API_BASE = '/api/v1'

export interface UpdateProfileRequest {
  first_name: string
  last_name: string
  email: string
}

export const profileService = {
  // Get current user profile
  async getProfile(): Promise<User> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch profile')
    }

    const data = await response.json()
    return data.data
  },

  // Update user profile
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE}/profile`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile: profileData
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }

    const data = await response.json()
    return data.data
  },
}