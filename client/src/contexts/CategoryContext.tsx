import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Category } from '@/types/api-generated'
import { getCategories } from '@/services/categoryService'

interface CategoryContextType {
  categories: Category[]
  loading: boolean
  error: string | null
  refreshCategories: () => Promise<void>
  lastFetchTime: number | null
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds
const STORAGE_KEY = 'categories_cache'
const STORAGE_TIMESTAMP_KEY = 'categories_cache_timestamp'

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async (forceRefresh = false) => {
    try {
      // Check if we have cached data
      const cachedData = localStorage.getItem(STORAGE_KEY)
      const cachedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY)
      
      if (!forceRefresh && cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp)
        const now = Date.now()
        
        // Use cached data if it's still fresh
        if (now - timestamp < CACHE_DURATION) {
          setCategories(JSON.parse(cachedData))
          setLastFetchTime(timestamp)
          setLoading(false)
          return
        }
      }

      // Fetch fresh data
      setLoading(true)
      setError(null)
      
      const data = await getCategories()
      const now = Date.now()
      
      // Update state
      setCategories(data)
      setLastFetchTime(now)
      
      // Cache the data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, now.toString())
      
    } catch (err) {
      console.error('Failed to load categories:', err)
      setError('Failed to load categories')
      
      // Try to use cached data even if expired
      const cachedData = localStorage.getItem(STORAGE_KEY)
      if (cachedData) {
        setCategories(JSON.parse(cachedData))
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshCategories = async () => {
    await loadCategories(true)
  }

  return (
    <CategoryContext.Provider 
      value={{ 
        categories, 
        loading, 
        error, 
        refreshCategories,
        lastFetchTime 
      }}
    >
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider')
  }
  return context
}