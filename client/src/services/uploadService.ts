const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

interface UploadResponse {
  id: string
  url: string
  derivatives: {
    thumb?: string
    medium?: string
    large?: string
  }
  metadata: {
    filename?: string
    mime_type?: string
    size: number
  }
  size: number
}

class UploadService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image')
    }

    return data.data
  }

  async deleteImage(filename: string, imageUrl?: string): Promise<void> {
    let url = `${API_BASE_URL}/uploads/${filename}`
    
    // If we have the full image URL, pass it as a query parameter
    // This helps the backend clean up product references
    if (imageUrl) {
      url += `?image_url=${encodeURIComponent(imageUrl)}`
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete image')
    }
  }

  // Helper to get full URL for display with size optimization
  getImageUrl(url: string, size: 'thumb' | 'medium' | 'large' | 'original' = 'medium'): string {
    if (url.startsWith('http')) {
      return url // Already a full URL
    }
    
    // Local development URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000'
    return `${baseUrl}${url}`
  }

  // Helper to get optimized URL from upload response
  getOptimizedUrl(uploadResponse: UploadResponse, size: 'thumb' | 'medium' | 'large' | 'original' = 'medium'): string {
    let url: string
    
    switch (size) {
      case 'thumb':
        url = uploadResponse.derivatives.thumb || uploadResponse.url
        break
      case 'medium':
        url = uploadResponse.derivatives.medium || uploadResponse.url
        break
      case 'large':
        url = uploadResponse.derivatives.large || uploadResponse.url
        break
      default:
        url = uploadResponse.url
    }
    
    return this.getImageUrl(url, size)
  }

  // Validate file before upload
  validateImage(file: File): { valid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPG, PNG, or WebP images.'
      }
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 5MB.'
      }
    }

    return { valid: true }
  }
}

const uploadService = new UploadService()

export const uploadImage = (file: File) => uploadService.uploadImage(file)
export const deleteImage = (filename: string, imageUrl?: string) => uploadService.deleteImage(filename, imageUrl)
export const getImageUrl = (url: string, size?: 'thumb' | 'medium' | 'large' | 'original') => uploadService.getImageUrl(url, size)
export const getOptimizedUrl = (uploadResponse: UploadResponse, size?: 'thumb' | 'medium' | 'large' | 'original') => uploadService.getOptimizedUrl(uploadResponse, size)
export const validateImage = (file: File) => uploadService.validateImage(file)

export type { UploadResponse }