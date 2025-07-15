import { Product, ApiResponse } from '@/types/api-generated'
import { UploadResponse } from './uploadService'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

interface ProductVariant {
  id?: string
  option1_value?: string
  option2_value?: string
  option3_value?: string
  price: number
  inventory: number
  sku?: string
  weight?: number
  dimensions?: string
}

interface CreateProductData {
  name: string
  description: string
  short_description?: string
  base_price: number
  compare_at_price?: number
  sku?: string
  track_inventory: boolean
  inventory: number
  low_stock_threshold: number
  weight?: number
  dimensions?: string
  materials?: string[]
  images?: (string | UploadResponse)[]
  videos?: string[]
  meta_title?: string
  meta_description?: string
  status: string
  is_featured: boolean
  category_id: string
  option1_name?: string
  option2_name?: string
  option3_name?: string
  variants?: ProductVariant[]
}

class ProductService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async getProducts(filters?: { 
    category_id?: string; 
    category_slug?: string; 
    store_id?: string;
    search?: string;
    sort_by?: string;
    page?: number;
    per_page?: number;
  }): Promise<{products: Product[], meta?: any}> {
    const params = new URLSearchParams()
    if (filters?.category_id) params.append('category_id', filters.category_id)
    if (filters?.category_slug) params.append('category_slug', filters.category_slug)
    if (filters?.store_id) params.append('store_id', filters.store_id)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.sort_by) params.append('sort_by', filters.sort_by)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.per_page) params.append('per_page', filters.per_page.toString())
    
    const response = await fetch(`${API_BASE_URL}/api/v1/products?${params}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch products')
    }

    return { products: data.data.products, meta: data.meta }
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch product')
    }

    return data.data.product
  }

  async getMyProducts(status?: string): Promise<Product[]> {
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    
    const response = await fetch(`${API_BASE_URL}/api/v1/products/my_products?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch your products')
    }

    return data.data.products
  }

  async createProduct(productData: CreateProductData): Promise<Product> {
    // Convert UploadResponse objects to URLs for the API
    const processedData = {
      ...productData,
      images: productData.images?.map(img => 
        typeof img === 'object' ? img.url : img
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ 
        product: processedData,
        variants: productData.variants 
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create product')
    }

    return data.data.product
  }

  async updateProduct(id: string, productData: Partial<CreateProductData>): Promise<Product> {
    // Convert UploadResponse objects to URLs for the API
    const processedData = {
      ...productData,
      images: productData.images?.map(img => 
        typeof img === 'object' ? img.url : img
      )
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ 
        product: processedData,
        variants: productData.variants 
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update product')
    }

    return data.data.product
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete product')
    }
  }
}

const productService = new ProductService()

export const getProducts = (filters?: { category_id?: string; category_slug?: string; store_id?: string }) => productService.getProducts(filters)
export const getProduct = (id: string) => productService.getProduct(id)
export const getMyProducts = (status?: string) => productService.getMyProducts(status)
export const createProduct = (productData: CreateProductData) => productService.createProduct(productData)
export const updateProduct = (id: string, productData: Partial<CreateProductData>) => productService.updateProduct(id, productData)
export const deleteProduct = (id: string) => productService.deleteProduct(id)

export type { CreateProductData, ProductVariant }