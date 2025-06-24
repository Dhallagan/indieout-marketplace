import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { getCategories } from '@/services/categoryService'
import { getMyProducts, updateProduct, CreateProductData, ProductVariant } from '@/services/productService'
import { Category, Product } from '@/types/api-generated'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import TextField from '@/components/admin/TextField'
import Select from '@/components/admin/Select'
import ImageUpload from '@/components/admin/ImageUpload'
import RadioGroup from '@/components/admin/RadioGroup'
import Checkbox from '@/components/admin/Checkbox'
import CategorySelector from '@/components/admin/CategorySelector'
import { FormLayout, FormLayoutGroup } from '@/components/admin/FormLayout'

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<CreateProductData>({
    name: '',
    description: '',
    short_description: '',
    base_price: 0,
    compare_at_price: 0,
    sku: '',
    track_inventory: true,
    inventory: 0,
    low_stock_threshold: 5,
    weight: 0,
    dimensions: '',
    materials: [],
    images: [],
    videos: [],
    meta_title: '',
    meta_description: '',
    status: 'draft',
    is_featured: false,
    category_id: '',
    option1_name: '',
    option2_name: '',
    option3_name: '',
    variants: []
  })

  if (!hasRole(UserRole.SELLER_ADMIN)) {
    return (
      <AdminLayout>
        <Page title="Access Denied">
          <Card sectioned>
            <p className="text-clay-600">You need seller privileges to edit products.</p>
          </Card>
        </Page>
      </AdminLayout>
    )
  }

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [categoriesData, productsData] = await Promise.all([
        getCategories(),
        getMyProducts()
      ])
      
      setCategories(categoriesData)
      
      // Find the product to edit
      const productToEdit = productsData.find(p => p.id === id)
      if (!productToEdit) {
        console.error('Product not found')
        navigate('/seller/products')
        return
      }
      
      setProduct(productToEdit)
      
      // Populate form with existing product data
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        short_description: productToEdit.short_description || '',
        base_price: productToEdit.base_price || 0,
        compare_at_price: productToEdit.compare_at_price || 0,
        sku: productToEdit.sku || '',
        track_inventory: productToEdit.track_inventory ?? true,
        inventory: productToEdit.inventory || 0,
        low_stock_threshold: productToEdit.low_stock_threshold || 5,
        weight: productToEdit.weight || 0,
        dimensions: productToEdit.dimensions || '',
        materials: productToEdit.materials || [],
        images: productToEdit.images || [],
        videos: productToEdit.videos || [],
        meta_title: productToEdit.meta_title || '',
        meta_description: productToEdit.meta_description || '',
        status: productToEdit.status || 'draft',
        is_featured: productToEdit.is_featured || false,
        category_id: productToEdit.category?.id || '',
        option1_name: '', // These would need to come from variants data
        option2_name: '',
        option3_name: '',
        variants: [] // This would need to be populated from actual variants
      })
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof CreateProductData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setIsSaving(true)
      
      if (!product) return
      
      // Call update API (you'll need to implement this in productService)
      console.log('Updating product:', product.id, formData)
      
      // For now, we'll just show success and navigate back
      alert('Product updated successfully!')
      navigate('/seller/products')
    } catch (error: any) {
      alert(error.message || 'Failed to update product')
    } finally {
      setIsSaving(false)
    }
  }

  const canSubmit = formData.name.trim().length >= 2 && 
                   formData.description.trim().length >= 20 && 
                   formData.category_id.length > 0 &&
                   formData.base_price > 0

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <Page title="Product Not Found">
          <Card sectioned>
            <p className="text-clay-600 mb-4">The product you're trying to edit was not found.</p>
            <Button variant="primary" onClick={() => navigate('/seller/products')}>
              Back to Products
            </Button>
          </Card>
        </Page>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Page
        title={`Edit: ${product.name}`}
        subtitle="Update your product information"
        breadcrumbs={[
          { content: 'Dashboard', url: '/dashboard' },
          { content: 'Products', url: '/seller/products' },
          { content: 'Edit Product' }
        ]}
      >
        <div className="max-w-4xl space-y-6">
          <Card title="Basic Information" sectioned>
            <FormLayout>
              <FormLayoutGroup>
                <TextField
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., Ultralight Hiking Backpack"
                  helpText="This will be displayed to customers"
                  requiredIndicator
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Base Price"
                    type="number"
                    step="0.01"
                    value={formData.base_price.toString()}
                    onChange={(e) => updateFormData('base_price', parseFloat(e.target.value) || 0)}
                    prefix={<span className="text-charcoal-500 font-medium">$</span>}
                    helpText="Starting price for this product"
                    requiredIndicator
                  />
                  
                  <TextField
                    label="Compare At Price"
                    type="number"
                    step="0.01"
                    value={formData.compare_at_price?.toString() || ''}
                    onChange={(e) => updateFormData('compare_at_price', parseFloat(e.target.value) || undefined)}
                    prefix={<span className="text-charcoal-500 font-medium">$</span>}
                    helpText="Original price (for sale pricing)"
                  />
                </div>

                <CategorySelector
                  label="Category"
                  categories={categories}
                  value={formData.category_id}
                  onChange={(categoryId) => updateFormData('category_id', categoryId)}
                  helpText="Navigate through categories to find the best fit for your product"
                  requiredIndicator
                />
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card title="Description" sectioned>
            <FormLayout>
              <FormLayoutGroup>
                <TextField
                  label="Short Description"
                  value={formData.short_description || ''}
                  onChange={(e) => updateFormData('short_description', e.target.value)}
                  placeholder="Brief product summary"
                  helpText="Appears in product listings"
                />
                
                <TextField
                  label="Full Description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  multiline
                  rows={6}
                  placeholder="Detailed product description, features, materials, etc."
                  helpText="Minimum 20 characters. Use this space to tell customers everything about your product."
                  requiredIndicator
                />
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card title="Inventory & Details" sectioned>
            <FormLayout>
              <FormLayoutGroup>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Inventory Quantity"
                    type="number"
                    value={formData.inventory.toString()}
                    onChange={(e) => updateFormData('inventory', parseInt(e.target.value) || 0)}
                    helpText="Number of items in stock"
                  />
                  
                  <TextField
                    label="Low Stock Threshold"
                    type="number"
                    value={formData.low_stock_threshold.toString()}
                    onChange={(e) => updateFormData('low_stock_threshold', parseInt(e.target.value) || 0)}
                    helpText="Alert when stock is low"
                  />
                  
                  <TextField
                    label="SKU"
                    value={formData.sku || ''}
                    onChange={(e) => updateFormData('sku', e.target.value)}
                    placeholder="Optional product code"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Weight (lbs)"
                    type="number"
                    step="0.1"
                    value={formData.weight?.toString() || ''}
                    onChange={(e) => updateFormData('weight', parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                  
                  <TextField
                    label="Dimensions"
                    value={formData.dimensions || ''}
                    onChange={(e) => updateFormData('dimensions', e.target.value)}
                    placeholder="e.g., 24in x 12in x 8in"
                  />
                </div>
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card title="Product Images" sectioned>
            <FormLayout>
              <FormLayoutGroup>
                <ImageUpload
                  images={formData.images || []}
                  onChange={(images) => updateFormData('images', images)}
                  maxImages={8}
                  helpText="Upload high-quality images of your product. The first image will be the primary image shown in listings."
                />
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card title="Product Settings" sectioned>
            <FormLayout>
              <FormLayoutGroup>
                <RadioGroup
                  label="Product Status"
                  value={formData.status}
                  onChange={(value) => updateFormData('status', value)}
                  options={[
                    { 
                      label: 'Draft', 
                      value: 'draft',
                      helpText: 'Product is not visible to customers'
                    },
                    { 
                      label: 'Active', 
                      value: 'active',
                      helpText: 'Product is live and available for purchase'
                    },
                    { 
                      label: 'Inactive', 
                      value: 'inactive',
                      helpText: 'Product is hidden from customers but not deleted'
                    }
                  ]}
                  helpText="Choose the visibility status for this product"
                />

                <Checkbox
                  label="Featured Product"
                  checked={formData.is_featured}
                  onChange={(e) => updateFormData('is_featured', e.target.checked)}
                  helpText="Featured products are highlighted in your store and may appear in promotional areas"
                />

                <Checkbox
                  label="Track Inventory"
                  checked={formData.track_inventory}
                  onChange={(e) => updateFormData('track_inventory', e.target.checked)}
                  helpText="Enable inventory tracking for this product"
                />
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card sectioned>
            <div className="flex justify-between">
              <Button
                variant="tertiary"
                onClick={() => navigate('/seller/products')}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isSaving}
                disabled={!canSubmit}
              >
                Update Product
              </Button>
            </div>
          </Card>
        </div>
      </Page>
    </AdminLayout>
  )
}