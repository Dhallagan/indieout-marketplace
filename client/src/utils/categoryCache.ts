import { Category } from '@/types/api-generated'

const CACHE_KEY = 'indieout_categories'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedCategories {
  data: Category[]
  timestamp: number
}

export const categoryCache = {
  get(): Category[] | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const { data, timestamp }: CachedCategories = JSON.parse(cached)
      
      // Check if cache is still valid
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }
      
      return data
    } catch {
      return null
    }
  },

  set(categories: Category[]) {
    try {
      const cacheData: CachedCategories = {
        data: categories,
        timestamp: Date.now()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch {
      // Ignore storage errors
    }
  },

  clear() {
    localStorage.removeItem(CACHE_KEY)
  }
}