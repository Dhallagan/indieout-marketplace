import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import Modal from '@/components/admin/Modal'
import TextField from '@/components/admin/TextField'
import Select from '@/components/admin/Select'
import { FormLayout, FormLayoutGroup } from '@/components/admin/FormLayout'
import CategoryTree from '@/components/CategoryTree'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/categoryService'
import { Category } from '@/types/api-generated'

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const data = await getCategories()
      setCategories(data)
      setError(null)
    } catch (err) {
      setError('Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCategoryAdd = (parentId?: string) => {
    setEditingCategory(null)
    setFormData({
      name: '',
      description: '',
      parent_id: parentId || ''
    })
    setIsModalOpen(true)
  }

  const handleCategoryEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parent_id: category.parent_id || ''
    })
    setIsModalOpen(true)
  }

  const handleCategoryDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      await deleteCategory(category.id)
      await loadCategories()
    } catch (err) {
      alert('Failed to delete category. Make sure it has no subcategories or products.')
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData)
      } else {
        await createCategory(formData)
      }
      
      setIsModalOpen(false)
      await loadCategories()
    } catch (err) {
      alert('Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '', parent_id: '' })
  }

  const getAllCategories = (cats: Category[]): Category[] => {
    let result: Category[] = []
    for (const cat of cats) {
      result.push(cat)
      if (cat.children && cat.children.length > 0) {
        result = result.concat(getAllCategories(cat.children))
      }
    }
    return result
  }

  const allCategories = getAllCategories(categories)

  const primaryAction = (
    <Button
      variant="primary"
      onClick={() => handleCategoryAdd()}
      icon={
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      }
    >
      Add Category
    </Button>
  )

  return (
    <AdminLayout>
      <Page
        title="Categories"
        subtitle="Organize and manage product categories for your marketplace"
        primaryAction={primaryAction}
        breadcrumbs={[
          { content: 'Dashboard', url: '/dashboard' },
          { content: 'Categories' }
        ]}
      >
        {error && (
          <Card sectioned>
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadCategories}>Try again</Button>
            </div>
          </Card>
        )}

        <Card title="Category Tree" sectioned>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading categories...</p>
            </div>
          ) : (
            <CategoryTree 
              categories={categories}
              onCategoryEdit={handleCategoryEdit}
              onCategoryDelete={handleCategoryDelete}
              onCategoryAdd={handleCategoryAdd}
              showActions={true}
            />
          )}
        </Card>

        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
          primaryAction={{
            content: editingCategory ? 'Update Category' : 'Create Category',
            onAction: handleSubmit,
            loading: isSaving
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleCloseModal
            }
          ]}
        >
          <FormLayout>
            <FormLayoutGroup>
              <TextField
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                requiredIndicator
                helpText="This will be displayed to customers"
              />
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                helpText="Optional description for this category"
              />
              
              <Select
                label="Parent Category"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                options={[
                  { label: 'Top Level Category', value: '' },
                  ...allCategories
                    .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                    .map(cat => ({ label: cat.name, value: cat.id }))
                ]}
                helpText="Select a parent category to create a subcategory"
              />
            </FormLayoutGroup>
          </FormLayout>
        </Modal>
      </Page>
    </AdminLayout>
  )
}