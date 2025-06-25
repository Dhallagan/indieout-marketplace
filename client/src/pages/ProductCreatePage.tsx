import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import { getCategories } from '@/services/categoryService'
import { createProduct, CreateProductData, ProductVariant } from '@/services/productService'
import { Category } from '@/types/api-generated'
import SellerLayout from '@/components/seller/SellerLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import TextField from '@/components/admin/TextField'
import Select from '@/components/admin/Select'
import ProductImageUpload from '@/components/seller/ProductImageUpload'
import RadioGroup from '@/components/admin/RadioGroup'
import Checkbox from '@/components/admin/Checkbox'
import CategorySelector from '@/components/admin/CategorySelector'
import { FormLayout, FormLayoutGroup } from '@/components/admin/FormLayout'

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const { hasRole } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
      <SellerLayout>
        <Page title="Access Denied">
          <Card sectioned>
            <p className="text-clay-600">You need seller privileges to create products.</p>
          </Card>
        </Page>
      </SellerLayout>
    )
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const updateFormData = (field: keyof CreateProductData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const hasVariants = formData.option1_name?.trim().length > 0

  const generateVariants = () => {
    if (!hasVariants) return []

    // For demo, create simple combinations
    // In real app, this would be a more sophisticated variant generator
    const option1Values = ['Small', 'Medium', 'Large']
    const option2Values = formData.option2_name ? ['Black', 'Blue', 'Green'] : ['']
    const option3Values = formData.option3_name ? ['Standard', 'Premium'] : ['']

    const variants: ProductVariant[] = []
    
    option1Values.forEach(opt1 => {
      option2Values.forEach(opt2 => {
        option3Values.forEach(opt3 => {
          variants.push({
            option1_value: opt1,
            option2_value: opt2 || undefined,
            option3_value: opt3 || undefined,
            price: formData.base_price,
            inventory: 0,
            sku: '',
            weight: formData.weight,
            dimensions: formData.dimensions
          })
        })
      })
    })

    return variants
  }

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...(formData.variants || [])]
    newVariants[index] = { ...newVariants[index], [field]: value }
    updateFormData('variants', newVariants)
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      option1_value: '',
      option2_value: formData.option2_name ? '' : undefined,
      option3_value: formData.option3_name ? '' : undefined,
      price: formData.base_price,
      inventory: 0,
      sku: '',
      weight: formData.weight,
      dimensions: formData.dimensions
    }
    updateFormData('variants', [...(formData.variants || []), newVariant])
  }

  const removeVariant = (index: number) => {
    const newVariants = formData.variants?.filter((_, i) => i !== index) || []
    updateFormData('variants', newVariants)
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      
      // If has variants, use variants, otherwise use base product inventory/price
      const productData = {
        ...formData,
        variants: hasVariants ? formData.variants : undefined
      }
      
      await createProduct(productData)
      navigate('/seller/products')
    } catch (error: any) {
      alert(error.message || 'Failed to create product')
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = formData.name.trim().length >= 2 && 
                   formData.description.trim().length >= 20 && 
                   formData.category_id.length > 0 &&
                   formData.base_price > 0


  return (
    <SellerLayout>
      <Page
        title="Add New Product"
        subtitle="Create a new product for your store"
        breadcrumbs={[
          { content: 'Dashboard', url: '/dashboard' },
          { content: 'Products', url: '/seller/products' },
          { content: 'Add Product' }
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
                  placeholder="Detailed product description, features, materials, etc."
                  helpText="Minimum 20 characters. Use this space to tell customers everything about your product."
                  requiredIndicator
                />
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card title="Product Options & Variants" sectioned>
            <FormLayout>
              <FormLayoutGroup title="Option Names">
                <p className="text-sm text-charcoal-600 mb-4">
                  Set up to 3 options for this product (e.g., Size, Color, Material). If you add options, you'll create variants with different combinations.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Option 1 Name"
                    value={formData.option1_name || ''}
                    onChange={(e) => updateFormData('option1_name', e.target.value)}
                    placeholder="e.g., Size"
                  />
                  
                  <TextField
                    label="Option 2 Name"
                    value={formData.option2_name || ''}
                    onChange={(e) => updateFormData('option2_name', e.target.value)}
                    placeholder="e.g., Color"
                  />
                  
                  <TextField
                    label="Option 3 Name"
                    value={formData.option3_name || ''}
                    onChange={(e) => updateFormData('option3_name', e.target.value)}
                    placeholder="e.g., Material"
                  />
                </div>
              </FormLayoutGroup>

              {hasVariants && (
                <FormLayoutGroup title="Variants">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-charcoal-600">
                        Create variants for different combinations of your options.
                      </p>
                      <Button variant="secondary" onClick={addVariant}>
                        Add Variant
                      </Button>
                    </div>

                    {formData.variants?.map((variant, index) => (
                      <div key={index} className="border border-charcoal-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium">Variant {index + 1}</h4>
                          <Button 
                            variant="plain" 
                            onClick={() => removeVariant(index)}
                            className="text-clay-600 hover:text-clay-700"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <TextField
                            label={formData.option1_name}
                            value={variant.option1_value || ''}
                            onChange={(e) => updateVariant(index, 'option1_value', e.target.value)}
                            placeholder="e.g., Large"
                          />
                          
                          {formData.option2_name && (
                            <TextField
                              label={formData.option2_name}
                              value={variant.option2_value || ''}
                              onChange={(e) => updateVariant(index, 'option2_value', e.target.value)}
                              placeholder="e.g., Black"
                            />
                          )}
                          
                          {formData.option3_name && (
                            <TextField
                              label={formData.option3_name}
                              value={variant.option3_value || ''}
                              onChange={(e) => updateVariant(index, 'option3_value', e.target.value)}
                              placeholder="e.g., Canvas"
                            />
                          )}
                          
                          <TextField
                            label="Price"
                            type="number"
                            step="0.01"
                            value={variant.price.toString()}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            prefix={<span className="text-charcoal-500 font-medium">$</span>}
                          />
                          
                          <TextField
                            label="Inventory"
                            type="number"
                            value={variant.inventory.toString()}
                            onChange={(e) => updateVariant(index, 'inventory', parseInt(e.target.value) || 0)}
                          />
                          
                          <TextField
                            label="SKU"
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </FormLayoutGroup>
              )}

              {!hasVariants && (
                <FormLayoutGroup title="Inventory">
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
                </FormLayoutGroup>
              )}
            </FormLayout>
          </Card>

          <Card title="Product Images" sectioned>
            <FormLayout>
              <FormLayoutGroup>
                <ProductImageUpload
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
                loading={isLoading}
                disabled={!canSubmit}
              >
                Create Product
              </Button>
            </div>
          </Card>
        </div>
      </Page>
    </SellerLayout>
  )
}