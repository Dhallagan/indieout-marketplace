import { useState } from 'react'
import { Category } from '@/types/api-generated'

interface CategoryTreeProps {
  categories: Category[]
  onCategorySelect?: (category: Category) => void
  onCategoryEdit?: (category: Category) => void
  onCategoryDelete?: (category: Category) => void
  onCategoryAdd?: (parentId?: string) => void
  showActions?: boolean
}

interface CategoryNodeProps {
  category: Category
  onSelect?: (category: Category) => void
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  onAdd?: (parentId: string) => void
  showActions?: boolean
  level?: number
}

function CategoryNode({ 
  category, 
  onSelect, 
  onEdit, 
  onDelete, 
  onAdd, 
  showActions = false,
  level = 0 
}: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  
  const hasChildren = category.children && category.children.length > 0
  const indentLevel = level * 20

  return (
    <div className="category-node">
      <div 
        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${indentLevel + 8}px` }}
      >
        <div className="flex items-center space-x-2">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <button
            onClick={() => onSelect?.(category)}
            className="flex items-center space-x-2 text-left hover:text-green-600"
          >
            <span className="font-medium">{category.name}</span>
            {category.description && (
              <span className="text-sm text-gray-500">({category.description})</span>
            )}
          </button>
        </div>

        {showActions && (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onAdd?.(category.id)}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
              title="Add subcategory"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => onEdit?.(category)}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="Edit category"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete?.(category)}
              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
              title="Delete category"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="category-children">
          {category.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              showActions={showActions}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryTree({ 
  categories, 
  onCategorySelect, 
  onCategoryEdit, 
  onCategoryDelete, 
  onCategoryAdd,
  showActions = false 
}: CategoryTreeProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No categories found</p>
        {showActions && onCategoryAdd && (
          <button
            onClick={() => onCategoryAdd()}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create First Category
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="category-tree">
      {showActions && onCategoryAdd && (
        <div className="mb-4">
          <button
            onClick={() => onCategoryAdd()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Top-Level Category</span>
          </button>
        </div>
      )}
      
      <div className="space-y-1">
        {categories.map((category) => (
          <CategoryNode
            key={category.id}
            category={category}
            onSelect={onCategorySelect}
            onEdit={onCategoryEdit}
            onDelete={onCategoryDelete}
            onAdd={onCategoryAdd}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  )
}