import { Category, ApiResponse } from '@/types/api-generated'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

class CategoryService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch categories')
    }

    return data.data.categories
  }

  async getCategory(id: string): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch category')
    }

    return data.data.category
  }

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ category: categoryData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create category')
    }

    return data.data.category
  }

  async updateCategory(id: string, categoryData: Partial<Category>): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ category: categoryData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update category')
    }

    return data.data.category
  }

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete category')
    }
  }
}

const categoryService = new CategoryService()

export const getCategories = () => categoryService.getCategories()
export const getCategory = (id: string) => categoryService.getCategory(id)
export const createCategory = (categoryData: Partial<Category>) => categoryService.createCategory(categoryData)
export const updateCategory = (id: string, categoryData: Partial<Category>) => categoryService.updateCategory(id, categoryData)
export const deleteCategory = (id: string) => categoryService.deleteCategory(id)