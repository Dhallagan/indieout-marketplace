import { useState } from 'react'
import { Link } from 'react-router-dom'

interface SellerApplicationData {
  // Personal Info
  first_name: string
  last_name: string
  email: string
  phone: string
  
  // Business Info
  business_name: string
  business_type: 'sole_proprietorship' | 'llc' | 'corporation' | 'partnership'
  business_description: string
  years_in_business: string
  website_url: string
  social_media_links: string
  
  // Product Info
  product_categories: string
  product_description: string
  manufacturing_process: string
  materials_sourced: string
  production_location: string
  
  // Brand Story
  brand_story: string
  sustainability_practices: string
  target_audience: string
  
  // Business Details
  tax_id: string
  business_address: string
  shipping_locations: string
  
  // References
  previous_marketplace_experience: string
  references: string
}

export default function SellerApplicationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<SellerApplicationData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    business_name: '',
    business_type: 'sole_proprietorship',
    business_description: '',
    years_in_business: '',
    website_url: '',
    social_media_links: '',
    product_categories: '',
    product_description: '',
    manufacturing_process: '',
    materials_sourced: '',
    production_location: '',
    brand_story: '',
    sustainability_practices: '',
    target_audience: '',
    tax_id: '',
    business_address: '',
    shipping_locations: '',
    previous_marketplace_experience: '',
    references: ''
  })

  const updateFormData = (field: keyof SellerApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/v1/seller_applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        alert(data.error || 'Application submission failed')
      }
    } catch (error) {
      alert('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.first_name && formData.last_name && formData.email && formData.phone
      case 2:
        return formData.business_name && formData.business_description && formData.brand_story
      case 3:
        return formData.product_description && formData.manufacturing_process && formData.production_location
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <div className="mx-auto h-12 w-12 text-green-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome to the Marketplace!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your seller account has been created! You can now log in and start setting up your store and adding products.
            </p>
          </div>
          <div className="mt-8 space-y-4">
            <Link 
              to="/login" 
              className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Log In to Your Account
            </Link>
            <Link to="/" className="block text-green-600 hover:text-green-700 font-medium">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply to Sell
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Join our curated marketplace of independent outdoor brands
          </p>
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step <= currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-300 text-gray-600'
                    }
                  `}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`
                      w-16 h-0.5 mx-2
                      ${step < currentStep ? 'bg-green-600' : 'bg-gray-300'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {currentStep === 1 && "Personal Information"}
            {currentStep === 2 && "Business Information"}
            {currentStep === 3 && "Product Information"}
            {currentStep === 4 && "Review & Submit"}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => updateFormData('first_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => updateFormData('last_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Business Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business/Brand Name *
                  </label>
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => updateFormData('business_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Alpine Adventures Co."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.business_type}
                    onChange={(e) => updateFormData('business_type', e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                    <option value="llc">LLC</option>
                    <option value="corporation">Corporation</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    value={formData.business_description}
                    onChange={(e) => updateFormData('business_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="Tell us about your business, what you make, and how long you've been operating..."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 50 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Story *
                  </label>
                  <textarea
                    value={formData.brand_story}
                    onChange={(e) => updateFormData('brand_story', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="What inspired you to start this brand? What makes your products unique?"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 50 characters</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years in Business
                    </label>
                    <input
                      type="text"
                      value={formData.years_in_business}
                      onChange={(e) => updateFormData('years_in_business', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g., 3 years"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => updateFormData('website_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Product Information */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    value={formData.product_description}
                    onChange={(e) => updateFormData('product_description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                    placeholder="Describe the types of products you plan to sell..."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 50 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturing Process *
                  </label>
                  <textarea
                    value={formData.manufacturing_process}
                    onChange={(e) => updateFormData('manufacturing_process', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="How do you make your products? Handmade, small batch, etc."
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Minimum 20 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Production Location *
                  </label>
                  <input
                    type="text"
                    value={formData.production_location}
                    onChange={(e) => updateFormData('production_location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Portland, Oregon, USA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Materials & Sourcing
                  </label>
                  <textarea
                    value={formData.materials_sourced}
                    onChange={(e) => updateFormData('materials_sourced', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="What materials do you use? Where do you source them from?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sustainability Practices
                  </label>
                  <textarea
                    value={formData.sustainability_practices}
                    onChange={(e) => updateFormData('sustainability_practices', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                    placeholder="What steps do you take to minimize environmental impact?"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Review Your Application</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Applicant</h3>
                    <p className="text-gray-600">{formData.first_name} {formData.last_name}</p>
                    <p className="text-gray-600">{formData.email}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Business</h3>
                    <p className="text-gray-600">{formData.business_name}</p>
                    <p className="text-gray-600">{formData.production_location}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong> After submitting your application, your seller account will be created immediately and you can start setting up your store and adding products right away!
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`
                      px-6 py-2 rounded-md font-medium
                      ${canProceed() 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`
                      px-6 py-2 rounded-md font-medium
                      ${!isLoading
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    {isLoading ? 'Submitting...' : 'Submit Application'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Already have account */}
        <div className="text-center mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}