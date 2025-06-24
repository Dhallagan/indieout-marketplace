import { useState, useEffect } from 'react'
import { Category } from '@/types/api-generated'

interface CategorySelectorProps {
  categories: Category[]
  value: string
  onChange: (categoryId: string) => void
  label?: string
  error?: string
  helpText?: string
  requiredIndicator?: boolean
}

export default function CategorySelector({
  categories,
  value,
  onChange,
  label,
  error,
  helpText,
  requiredIndicator
}: CategorySelectorProps) {
  const [selectedPath, setSelectedPath] = useState<Category[]>([])
  
  // Initialize selected path from value
  useEffect(() => {
    if (value) {
      const path = findCategoryPath(categories, value)
      setSelectedPath(path)
    } else {
      setSelectedPath([])
    }
  }, [value, categories])

  // Find the path to a category (for breadcrumbs)
  const findCategoryPath = (cats: Category[], targetId: string): Category[] => {
    for (const cat of cats) {
      if (cat.id === targetId) {
        return [cat]
      }
      if (cat.children && cat.children.length > 0) {
        const childPath = findCategoryPath(cat.children, targetId)
        if (childPath.length > 0) {
          return [cat, ...childPath]
        }
      }
    }
    return []
  }

  // Get top-level categories
  const getTopLevelCategories = () => {
    return categories.filter(cat => !cat.parent_id)
  }

  // Get children of selected category
  const getChildCategories = (parentCategory: Category) => {
    return parentCategory.children || []
  }

  // Get current level categories to show
  const getCurrentLevelCategories = () => {
    if (selectedPath.length === 0) {
      return getTopLevelCategories()
    }
    
    const lastSelected = selectedPath[selectedPath.length - 1]
    const children = getChildCategories(lastSelected)
    
    // If no children, we're at a leaf category
    return children
  }

  const handleCategorySelect = (category: Category) => {
    const newPath = [...selectedPath, category]
    setSelectedPath(newPath)
    
    // If this category has no children, it's the final selection
    const hasChildren = category.children && category.children.length > 0
    if (!hasChildren) {
      onChange(category.id)
    }
  }

  const handleBreadcrumbClick = (index: number) => {
    const newPath = selectedPath.slice(0, index + 1)
    setSelectedPath(newPath)
    
    if (index === -1) {
      // Clicked "Categories" - go back to root
      setSelectedPath([])
      onChange('')
    } else {
      // Check if we clicked on a leaf category
      const clickedCategory = newPath[newPath.length - 1]
      const hasChildren = clickedCategory.children && clickedCategory.children.length > 0
      if (!hasChildren) {
        onChange(clickedCategory.id)
      }
    }
  }

  const currentCategories = getCurrentLevelCategories()
  const isAtLeafLevel = selectedPath.length > 0 && currentCategories.length === 0

  return (
    <div className="w-full">
      {label && (
        <label className={`
          block text-sm font-medium mb-2 transition-colors duration-200
          ${error ? 'text-red-700' : 'text-gray-700'}
        `}>
          {label}
          {requiredIndicator && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}

      <div className={`
        border rounded-lg p-4 transition-all duration-200
        ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'}
      `}>
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(-1)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Categories
            </button>
            
            {selectedPath.map((category, index) => (
              <div key={category.id} className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`
                    ${index === selectedPath.length - 1 && isAtLeafLevel 
                      ? 'text-gray-900 font-semibold' 
                      : 'text-blue-600 hover:text-blue-800'
                    }
                  `}
                >
                  {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Category Selection */}
        {isAtLeafLevel ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-700 font-medium">
                Category selected: {selectedPath[selectedPath.length - 1]?.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700 mb-3">
              {selectedPath.length === 0 
                ? 'Choose a main category:' 
                : `Choose a subcategory in ${selectedPath[selectedPath.length - 1]?.name}:`
              }
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {currentCategories.map((category) => {
                const hasChildren = category.children && category.children.length > 0
                
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className="flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500 mt-1">{category.description}</div>
                      )}
                    </div>
                    
                    {hasChildren && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 flex items-start space-x-1">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-600 leading-5">{error}</p>
        </div>
      )}

      {helpText && !error && (
        <p className="mt-2 text-sm text-gray-500 leading-5">{helpText}</p>
      )}
    </div>
  )
}