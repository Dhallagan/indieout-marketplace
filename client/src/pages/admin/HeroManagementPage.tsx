import { useState, useEffect } from 'react'
import { getHeroContent, updateHeroContent } from '@/services/heroService'
import AdminLayout from '@/components/admin/AdminLayout'
import Page from '@/components/admin/Page'
import Card from '@/components/admin/Card'
import Button from '@/components/admin/Button'

interface HeroContent {
  id?: string
  title: string
  subtitle?: string
  description: string
  cta_primary_text: string
  cta_primary_url: string
  cta_secondary_text: string
  cta_secondary_url: string
  background_image?: string
  featured_collection_title?: string
  featured_collection_subtitle?: string
  featured_collection_image?: string
  is_active: boolean
}

export default function HeroManagementPage() {
  const [heroContent, setHeroContent] = useState<HeroContent>({
    title: '',
    subtitle: '',
    description: '',
    cta_primary_text: '',
    cta_primary_url: '',
    cta_secondary_text: '',
    cta_secondary_url: '',
    background_image: '',
    featured_collection_title: '',
    featured_collection_subtitle: '',
    featured_collection_image: '',
    is_active: true
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadHeroContent()
  }, [])

  const loadHeroContent = async () => {
    try {
      setIsLoading(true)
      const data = await getHeroContent()
      setHeroContent(data)
    } catch (error) {
      console.error('Failed to load hero content:', error)
      setMessage('Failed to load hero content')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      const updatedHero = await updateHeroContent(heroContent)
      setHeroContent(updatedHero)
      setMessage('Hero content updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Failed to update hero content:', error)
      setMessage('Failed to update hero content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof HeroContent) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setHeroContent(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-sand-50 flex items-center justify-center">
          <div className="text-lg font-semibold text-charcoal-600">Loading hero content...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Page
        title="Hero Content Management"
        subtitle="Manage the main hero section on your homepage"
      >

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <Card sectioned>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-charcoal-700 mb-2">
                  Main Headline *
                </label>
                <input
                  type="text"
                  value={heroContent.title}
                  onChange={handleChange('title')}
                  className="w-full border border-sand-200 rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Handcrafted gear for trail-worthy adventures"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-bold text-charcoal-700 mb-2">
                  Subtitle (optional)
                </label>
                <input
                  type="text"
                  value={heroContent.subtitle || ''}
                  onChange={handleChange('subtitle')}
                  className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional subtitle"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-charcoal-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={heroContent.description}
                  onChange={handleChange('description')}
                  rows={3}
                  className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Connect with independent sellers creating durable, sustainable outdoor equipment for your next journey."
                  required
                />
              </div>

              {/* CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-charcoal-800 mb-4">Primary Button</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-charcoal-700 mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={heroContent.cta_primary_text}
                        onChange={handleChange('cta_primary_text')}
                        className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Explore the marketplace"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-charcoal-700 mb-2">
                        Button URL
                      </label>
                      <input
                        type="url"
                        value={heroContent.cta_primary_url}
                        onChange={handleChange('cta_primary_url')}
                        className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://indieout.com/shop"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-charcoal-800 mb-4">Secondary Button</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-charcoal-700 mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={heroContent.cta_secondary_text}
                        onChange={handleChange('cta_secondary_text')}
                        className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Start selling your gear"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-charcoal-700 mb-2">
                        Button URL
                      </label>
                      <input
                        type="url"
                        value={heroContent.cta_secondary_url}
                        onChange={handleChange('cta_secondary_url')}
                        className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://indieout.com/apply-to-sell"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-bold text-charcoal-700 mb-2">
                  Background Image URL (optional)
                </label>
                <input
                  type="url"
                  value={heroContent.background_image || ''}
                  onChange={handleChange('background_image')}
                  className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/hero-background.jpg"
                />
              </div>

              {/* Featured Collection Section */}
              <div className="border-t border-sand-200 pt-6">
                <h3 className="text-lg font-bold text-charcoal-800 mb-4">Featured Collection Card</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-charcoal-700 mb-2">
                      Collection Title
                    </label>
                    <input
                      type="text"
                      value={heroContent.featured_collection_title || ''}
                      onChange={handleChange('featured_collection_title')}
                      className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="FEATURED COLLECTION"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-charcoal-700 mb-2">
                      Collection Subtitle
                    </label>
                    <input
                      type="text"
                      value={heroContent.featured_collection_subtitle || ''}
                      onChange={handleChange('featured_collection_subtitle')}
                      className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Desert Trail Essentials"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-charcoal-700 mb-2">
                      Collection Background Image URL
                    </label>
                    <input
                      type="url"
                      value={heroContent.featured_collection_image || ''}
                      onChange={handleChange('featured_collection_image')}
                      className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://example.com/collection-image.jpg"
                    />
                    <p className="text-sm text-charcoal-500 mt-1">
                      This image will be used as the background for the featured collection card
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 pt-6 border-t border-sand-200">
              <Button
                type="submit"
                variant="primary"
                size="large"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Update Hero Content'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Preview */}
        <Card sectioned className="mt-8">
          <h2 className="text-xl font-bold text-charcoal-900 mb-6">Preview</h2>
          <div className="bg-gradient-to-br from-sand-25 via-white to-sand-100 rounded-xl p-8" 
               style={heroContent.background_image ? { 
                 backgroundImage: `url(${heroContent.background_image})`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center'
               } : {}}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl lg:text-5xl font-bold text-charcoal-900 mb-4">
                  {heroContent.title || 'Your headline here'}
                </h1>
                {heroContent.subtitle && (
                  <h2 className="text-xl text-charcoal-700 mb-4 font-semibold">
                    {heroContent.subtitle}
                  </h2>
                )}
                <p className="text-lg text-charcoal-600 mb-8">
                  {heroContent.description || 'Your description here'}
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {heroContent.cta_primary_text && (
                    <button className="bg-forest-600 text-white px-6 py-3 rounded-lg font-medium">
                      {heroContent.cta_primary_text}
                    </button>
                  )}
                  {heroContent.cta_secondary_text && (
                    <button className="border border-forest-600 text-forest-600 px-6 py-3 rounded-lg font-medium">
                      {heroContent.cta_secondary_text}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Featured Collection Card Preview */}
              <div className="relative">
                <div 
                  className="bg-gradient-to-br from-sand-200 to-sand-300 rounded-2xl p-8 h-80 flex items-center justify-center"
                  style={heroContent.featured_collection_image ? {
                    backgroundImage: `url(${heroContent.featured_collection_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  <div className="text-center relative z-10">
                    <span className={`text-sm font-medium mb-2 block ${
                      heroContent.featured_collection_image ? 'text-white' : 'text-forest-700'
                    }`}>
                      {heroContent.featured_collection_title || 'FEATURED COLLECTION'}
                    </span>
                    <h3 className={`text-2xl font-bold ${
                      heroContent.featured_collection_image ? 'text-white' : 'text-forest-900'
                    }`}>
                      {heroContent.featured_collection_subtitle || 'Desert Trail Essentials'}
                    </h3>
                  </div>
                  {heroContent.featured_collection_image && (
                    <div className="absolute inset-0 bg-black/30 rounded-2xl"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Page>
    </AdminLayout>
  )
}