import { Store, ApiResponse } from '@/types/api-generated'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

class StoreService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async getStores(): Promise<Store[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/stores`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stores')
    }

    return data.data.stores
  }

  async getStore(id: string): Promise<Store> {
    const response = await fetch(`${API_BASE_URL}/api/v1/stores/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch store')
    }

    return data.data.store
  }

  async getPublicStore(id: string): Promise<Store> {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/stores/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch store')
    }

    return data.data.store
  }

  async getPublicStores(): Promise<Store[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/stores`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch stores')
    }

    return data.data.stores
  }

  async createStore(storeData: Partial<Store>): Promise<Store> {
    const response = await fetch(`${API_BASE_URL}/api/v1/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ store: storeData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create store')
    }

    return data.data.store
  }

  async updateStore(id: string, storeData: Partial<Store> | FormData): Promise<Store> {
    const isFormData = storeData instanceof FormData
    
    const headers: HeadersInit = {
      ...this.getAuthHeaders(),
    }
    
    // Only set Content-Type for JSON, not for FormData
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/stores/${id}`, {
      method: 'PUT',
      headers,
      body: isFormData ? storeData : JSON.stringify({ store: storeData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update store')
    }

    return data.data.store
  }

  async deleteStore(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/stores/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete store')
    }
  }

  async submitForReview(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/stores/${id}/submit-for-review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit store for review')
    }
  }
}

const storeService = new StoreService()

export const getStores = () => storeService.getStores()
export const getPublicStores = () => storeService.getPublicStores()
export const getStore = (id: string) => storeService.getStore(id)
export const getPublicStore = (id: string) => storeService.getPublicStore(id)
export const createStore = (storeData: any) => storeService.createStore(storeData)
export const updateStore = (id: string, storeData: any | FormData) => storeService.updateStore(id, storeData)
export const deleteStore = (id: string) => storeService.deleteStore(id)
export const submitForReview = (id: string) => storeService.submitForReview(id)