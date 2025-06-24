import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { createStore } from '@/services/storeService'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import TextField from '@/components/admin/TextField'
import Modal from '@/components/admin/Modal'
import { FormLayout, FormLayoutGroup } from '@/components/admin/FormLayout'

export default function StoreSetupPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: ''
  })

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const store = await createStore(formData)
      
      // Update user context with store info
      const updatedUser = { ...user!, store }
      setUser(updatedUser)
      
      // Redirect to dashboard
      navigate('/dashboard')
    } catch (error: any) {
      alert(error.message || 'Failed to create store')
    } finally {
      setIsLoading(false)
    }
  }

  const canSubmit = formData.name.trim().length >= 2 && formData.description.trim().length >= 20

  return (
    <AdminLayout>
      <Page
        title="Set Up Your Store"
        subtitle="Create your marketplace presence and start selling your products"
        breadcrumbs={[
          { content: 'Dashboard', url: '/dashboard' },
          { content: 'Store Setup' }
        ]}
      >
        <div className="max-w-2xl">
          <Card title="Store Information" sectioned>
            <FormLayout>
              <FormLayoutGroup title="Basic Information">
                <TextField
                  label="Store Name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="e.g., Alpine Adventures Co."
                  helpText="This will be your store's display name on the marketplace"
                  requiredIndicator
                />
                
                <TextField
                  label="Store Description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  multiline
                  placeholder="Tell customers about your brand, what you make, and what makes your products unique..."
                  helpText="Minimum 20 characters. This appears on your store page."
                  requiredIndicator
                />
                
                <TextField
                  label="Website URL"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  helpText="Optional - link to your main website"
                />
              </FormLayoutGroup>
            </FormLayout>
          </Card>

          <Card sectioned>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-900 mb-2">Next Steps</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Create your store profile</li>
                <li>• Add your first products</li>
                <li>• Submit your store for review</li>
                <li>• Once approved, your store will be live!</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button
                variant="tertiary"
                onClick={() => navigate('/dashboard')}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={!canSubmit}
              >
                Create Store
              </Button>
            </div>
          </Card>
        </div>
      </Page>
    </AdminLayout>
  )
}