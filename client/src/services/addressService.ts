import { Address, CreateAddressRequest, UpdateAddressRequest } from '@/types/api-generated'

const API_BASE = '/api/v1'

interface AddressesResponse {
  data: {
    id: string
    type: string
    attributes: Address
  }[]
}

interface AddressResponse {
  data: {
    id: string
    type: string
    attributes: Address
  }
}

export const addressService = {
  // Get all addresses for the current user
  async getAddresses(): Promise<Address[]> {
    const response = await fetch(`${API_BASE}/addresses`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch addresses')
    }

    const data: AddressesResponse = await response.json()
    return data.data.map(item => ({ id: item.id, ...item.attributes }))
  },

  // Get a specific address
  async getAddress(id: string): Promise<Address> {
    const response = await fetch(`${API_BASE}/addresses/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch address')
    }

    const data: AddressResponse = await response.json()
    return { id: data.data.id, ...data.data.attributes }
  },

  // Create a new address
  async createAddress(addressData: CreateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE}/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ address: addressData }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.errors?.[0] || 'Failed to create address')
    }

    const data: AddressResponse = await response.json()
    return { id: data.data.id, ...data.data.attributes }
  },

  // Update an address
  async updateAddress(id: string, addressData: UpdateAddressRequest): Promise<Address> {
    const response = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ address: addressData }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.errors?.[0] || 'Failed to update address')
    }

    const data: AddressResponse = await response.json()
    return { id: data.data.id, ...data.data.attributes }
  },

  // Delete an address
  async deleteAddress(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete address')
    }
  },

  // Set an address as default
  async setDefaultAddress(id: string): Promise<Address> {
    const response = await fetch(`${API_BASE}/addresses/${id}/set_default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to set default address')
    }

    const data: AddressResponse = await response.json()
    return { id: data.data.id, ...data.data.attributes }
  },
}