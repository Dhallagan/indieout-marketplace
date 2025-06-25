import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/types/auth'
import SellerLayout from '@/components/seller/SellerLayout'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'
import TextField from '@/components/admin/TextField'
import Select from '@/components/admin/Select'
import Checkbox from '@/components/admin/Checkbox'
import ImageUpload from '@/components/admin/ImageUpload'
import { FormLayout, FormLayoutGroup } from '@/components/admin/FormLayout'

interface StoreData {
  name: string
  description: string
  logo: string[]
  website: string
  phone: string
  contact_email: string
}

export default function SellerSettingsPage() {
  const { hasRole } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('store')
  const [storeData, setStoreData] = useState<StoreData>({
    name: 'IndieOut Store',
    description: 'Premium outdoor gear for serious adventurers',
    logo: [],
    website: 'https://indieout.com',
    phone: '(555) 123-4567',
    contact_email: 'contact@indieout.com'
  })

  if (!hasRole(UserRole.SELLER_ADMIN)) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Access Denied</h1>
          </div>
          <Card sectioned>
            <p className="text-clay-600">You need seller privileges to access settings.</p>
          </Card>
        </div>
      </SellerLayout>
    )
  }

  const updateStoreData = (field: keyof StoreData, value: any) => {
    setStoreData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      console.log('Saving store data:', storeData)
      alert('Settings saved successfully!')
    } catch (error: any) {
      alert(error.message || 'Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'store', label: 'Store Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'account', label: 'Account' }
  ]

  return (
    <SellerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Seller Settings</h1>
          <p className="text-charcoal-600 mt-1">Manage your store and account preferences</p>
        </div>
        <div className="max-w-4xl space-y-6">
          {/* Tab Navigation */}
          <Card sectioned>
            <div className="border-b border-charcoal-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      py-2 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-forest-500 text-forest-600'
                        : 'border-transparent text-charcoal-500 hover:text-charcoal-700 hover:border-charcoal-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </Card>

          {/* Store Profile Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <Card title="Store Information" sectioned>
                <FormLayout>
                  <FormLayoutGroup>
                    <TextField
                      label="Store Name"
                      value={storeData.name}
                      onChange={(e) => updateStoreData('name', e.target.value)}
                      placeholder="IndieOut Store"
                      helpText="Your store name as it appears to customers"
                      requiredIndicator
                    />

                    <TextField
                      label="Store Description"
                      value={storeData.description}
                      onChange={(e) => updateStoreData('description', e.target.value)}
                      multiline
                      rows={4}
                      placeholder="Tell customers about your store..."
                      helpText="This appears on your store page"
                    />
                  </FormLayoutGroup>
                </FormLayout>
              </Card>

              <Card title="Store Logo" sectioned>
                <FormLayout>
                  <FormLayoutGroup>
                    <ImageUpload
                      images={storeData.logo}
                      onChange={(images) => updateStoreData('logo', images)}
                      maxImages={1}
                      helpText="Square logo, 300x300px recommended"
                    />
                  </FormLayoutGroup>
                </FormLayout>
              </Card>

              <Card title="Contact Information" sectioned>
                <FormLayout>
                  <FormLayoutGroup>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Contact Email"
                        type="email"
                        value={storeData.contact_email}
                        onChange={(e) => updateStoreData('contact_email', e.target.value)}
                        placeholder="contact@indieout.com"
                      />
                      
                      <TextField
                        label="Phone Number"
                        type="tel"
                        value={storeData.phone}
                        onChange={(e) => updateStoreData('phone', e.target.value)}
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <TextField
                      label="Website"
                      type="url"
                      value={storeData.website}
                      onChange={(e) => updateStoreData('website', e.target.value)}
                      placeholder="https://indieout.com"
                    />
                  </FormLayoutGroup>
                </FormLayout>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card title="Notification Preferences" sectioned>
              <FormLayout>
                <FormLayoutGroup>
                  <div className="space-y-4">
                    <Checkbox
                      label="Email Notifications"
                      checked={true}
                      onChange={() => {}}
                      helpText="Receive notifications via email"
                    />
                    
                    <Checkbox
                      label="Order Notifications"
                      checked={true}
                      onChange={() => {}}
                      helpText="Get notified when you receive new orders"
                    />
                    
                    <Checkbox
                      label="Review Notifications"
                      checked={true}
                      onChange={() => {}}
                      helpText="Get notified when customers leave reviews"
                    />
                    
                    <Checkbox
                      label="Marketing Emails"
                      checked={false}
                      onChange={() => {}}
                      helpText="Receive tips and promotional content"
                    />
                  </div>
                </FormLayoutGroup>
              </FormLayout>
            </Card>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <Card title="Account Security" sectioned>
                <FormLayout>
                  <FormLayoutGroup>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-charcoal-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-charcoal-900">Change Password</h4>
                          <p className="text-sm text-charcoal-500">Update your account password</p>
                        </div>
                        <Button variant="secondary">
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border border-charcoal-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-charcoal-900">Two-Factor Authentication</h4>
                          <p className="text-sm text-charcoal-500">Add an extra layer of security</p>
                        </div>
                        <Button variant="secondary">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </FormLayoutGroup>
                </FormLayout>
              </Card>

              <Card title="Danger Zone" sectioned>
                <FormLayout>
                  <FormLayoutGroup>
                    <div className="flex items-center justify-between p-4 border border-clay-200 rounded-lg bg-clay-50">
                      <div>
                        <h4 className="font-medium text-clay-900">Delete Account</h4>
                        <p className="text-sm text-clay-600">Permanently delete your seller account</p>
                      </div>
                      <Button variant="secondary">
                        Delete Account
                      </Button>
                    </div>
                  </FormLayoutGroup>
                </FormLayout>
              </Card>
            </div>
          )}

          {/* Save Button */}
          <Card sectioned>
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSave}
                loading={isLoading}
              >
                Save Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </SellerLayout>
  )
}