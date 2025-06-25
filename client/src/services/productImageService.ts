import { ProductImage } from '@/types/api-generated'

const API_BASE = '/api/v1'

interface ProductImageCreateParams {
  uploaded_file_id?: string
  file?: File
  alt_text?: string
}

interface ProductImageUpdateParams {
  alt_text?: string
  position?: number
}

export const productImageService = {
  // Get all images for a product
  async list(productId: string): Promise<ProductImage[]> {
    const response = await fetch(`${API_BASE}/products/${productId}/images`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch product images')
    }
    
    const data = await response.json()
    // Handle JSONAPI response format for array of images
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((item: any) => ({
        id: item.id,
        ...item.attributes,
        product_id: item.relationships?.product?.data?.id
      }))
    }
    return data || []
  },

  // Get a single image
  async get(productId: string, imageId: string): Promise<ProductImage> {
    const response = await fetch(`${API_BASE}/products/${productId}/images/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch product image')
    }
    
    const data = await response.json()
    // Handle JSONAPI response format
    return data.data ? {
      id: data.data.id,
      ...data.data.attributes,
      product_id: data.data.relationships?.product?.data?.id
    } : data
  },

  // Create a new product image
  async create(productId: string, params: ProductImageCreateParams): Promise<ProductImage> {
    const formData = new FormData()
    
    if (params.file) {
      formData.append('file', params.file)
    } else if (params.uploaded_file_id) {
      formData.append('uploaded_file_id', params.uploaded_file_id)
    } else {
      throw new Error('Either file or uploaded_file_id must be provided')
    }
    
    if (params.alt_text) {
      formData.append('alt_text', params.alt_text)
    }
    
    const headers: HeadersInit = {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
    
    if (!params.file) {
      headers['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(`${API_BASE}/products/${productId}/images`, {
      method: 'POST',
      headers,
      body: params.file ? formData : JSON.stringify({
        uploaded_file_id: params.uploaded_file_id,
        alt_text: params.alt_text
      })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create product image')
    }
    
    const data = await response.json()
    // Handle JSONAPI response format
    return data.data ? {
      id: data.data.id,
      ...data.data.attributes,
      product_id: data.data.relationships?.product?.data?.id
    } : data
  },

  // Update a product image
  async update(productId: string, imageId: string, params: ProductImageUpdateParams): Promise<ProductImage> {
    const response = await fetch(`${API_BASE}/products/${productId}/images/${imageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error('Failed to update product image')
    }
    
    const data = await response.json()
    // Handle JSONAPI response format
    return data.data ? {
      id: data.data.id,
      ...data.data.attributes,
      product_id: data.data.relationships?.product?.data?.id
    } : data
  },

  // Delete a product image
  async delete(productId: string, imageId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete product image')
    }
  },

  // Reorder product images
  async reorder(productId: string, imageIds: string[]): Promise<void> {
    const response = await fetch(`${API_BASE}/products/${productId}/images/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ image_ids: imageIds })
    })
    
    if (!response.ok) {
      throw new Error('Failed to reorder images')
    }
  },

  // Set an image as primary
  async setPrimary(productId: string, imageId: string): Promise<ProductImage> {
    const response = await fetch(`${API_BASE}/products/${productId}/images/${imageId}/set_primary`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to set primary image')
    }
    
    const data = await response.json()
    // Handle JSONAPI response format
    return data.data ? {
      id: data.data.id,
      ...data.data.attributes,
      product_id: data.data.relationships?.product?.data?.id
    } : data
  }
}