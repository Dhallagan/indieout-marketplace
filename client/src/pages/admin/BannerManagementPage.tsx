import { useState, useEffect } from 'react'
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/services/bannerService'
import { Banner, CreateBannerData, UpdateBannerData } from '@/types/api-generated'

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState<CreateBannerData>({
    title: '',
    subtitle: '',
    description: '',
    cta_text: '',
    cta_url: '',
    background_color: '#f0f9ff',
    text_color: '#1f2937',
    position: 0,
    is_active: true
  })

  useEffect(() => {
    loadBanners()
  }, [])

  const loadBanners = async () => {
    try {
      setIsLoading(true)
      const bannersData = await getBanners()
      setBanners(bannersData)
    } catch (error) {
      console.error('Failed to load banners:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingBanner) {
        const updatedBanner = await updateBanner(editingBanner.id, formData)
        setBanners(banners.map(b => b.id === updatedBanner.id ? updatedBanner : b))
        setEditingBanner(null)
      } else {
        const newBanner = await createBanner(formData)
        setBanners([...banners, newBanner])
        setIsCreating(false)
      }
      
      // Reset form
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        cta_text: '',
        cta_url: '',
        background_color: '#f0f9ff',
        text_color: '#1f2937',
        position: 0,
        is_active: true
      })
    } catch (error) {
      console.error('Failed to save banner:', error)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      cta_text: banner.cta_text || '',
      cta_url: banner.cta_url || '',
      background_color: banner.background_color || '#f0f9ff',
      text_color: banner.text_color || '#1f2937',
      position: banner.position,
      is_active: banner.is_active
    })
  }

  const handleDelete = async (bannerId: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return
    
    try {
      await deleteBanner(bannerId)
      setBanners(banners.filter(b => b.id !== bannerId))
    } catch (error) {
      console.error('Failed to delete banner:', error)
    }
  }

  const cancelEdit = () => {
    setEditingBanner(null)
    setIsCreating(false)
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      cta_text: '',
      cta_url: '',
      background_color: '#f0f9ff',
      text_color: '#1f2937',
      position: 0,
      is_active: true
    })
  }

  return (
    <div className="min-h-screen bg-sand-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-charcoal-900">Banner Management</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-forest-600 hover:bg-forest-700 text-white font-bold px-6 py-3 rounded-full transition-colors"
          >
            Create New Banner
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingBanner) && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-charcoal-900 mb-6">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    CTA Text
                  </label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({...formData, cta_text: e.target.value})}
                    className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    CTA URL
                  </label>
                  <input
                    type="url"
                    value={formData.cta_url}
                    onChange={(e) => setFormData({...formData, cta_url: e.target.value})}
                    className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({...formData, background_color: e.target.value})}
                    className="w-full h-12 border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    Text Color
                  </label>
                  <input
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({...formData, text_color: e.target.value})}
                    className="w-full h-12 border border-sand-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-charcoal-700 mb-2">
                    Position
                  </label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: parseInt(e.target.value)})}
                    className="w-full border border-sand-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-3 h-5 w-5 text-forest-600 focus:ring-forest-500 border-sand-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-charcoal-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-6 py-3 border border-sand-300 text-charcoal-600 font-semibold rounded-full hover:bg-sand-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white font-bold rounded-full transition-colors"
                >
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-lg font-semibold text-charcoal-600">Loading banners...</div>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-lg font-semibold text-charcoal-600">No banners created yet</div>
              <p className="text-charcoal-500 mt-2">Create your first banner to get started</p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Banner Preview */}
                <div
                  className="p-8"
                  style={{
                    backgroundColor: banner.background_color || '#f0f9ff',
                    color: banner.text_color || '#1f2937'
                  }}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-black mb-2">{banner.title}</h3>
                    {banner.subtitle && (
                      <p className="text-lg font-semibold mb-2 opacity-90">{banner.subtitle}</p>
                    )}
                    {banner.description && (
                      <p className="text-base mb-4 opacity-80">{banner.description}</p>
                    )}
                    {banner.cta_text && (
                      <span className="inline-block bg-forest-600 text-white font-bold px-6 py-3 rounded-full">
                        {banner.cta_text}
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Controls */}
                <div className="p-6 bg-sand-50 border-t border-sand-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-4 text-sm text-charcoal-600">
                        <span className={`px-3 py-1 rounded-full font-semibold ${
                          banner.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {banner.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span>Position: {banner.position}</span>
                        {banner.status && (
                          <span className="capitalize">Status: {banner.status}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}