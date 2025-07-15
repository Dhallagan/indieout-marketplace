const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
  is_active: boolean
}

class HeroService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Public endpoint to get current hero content
  async getCurrentHeroContent(): Promise<HeroContent> {
    const response = await fetch(`${API_BASE_URL}/api/v1/hero-content/current`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch hero content')
    }

    return data.data.hero
  }

  // Admin endpoint to get hero content for editing
  async getHeroContent(): Promise<HeroContent> {
    const response = await fetch(`${API_BASE_URL}/api/v1/hero-content`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch hero content')
    }

    return data.data.hero
  }

  // Admin endpoint to update hero content
  async updateHeroContent(heroData: HeroContent | FormData): Promise<HeroContent> {
    const isFormData = heroData instanceof FormData
    
    const headers: HeadersInit = {
      ...this.getAuthHeaders(),
    }
    
    // Only set Content-Type for JSON, not for FormData (browser will set boundary)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    const response = await fetch(`${API_BASE_URL}/api/v1/hero-content`, {
      method: 'PUT',
      headers,
      body: isFormData ? heroData : JSON.stringify({ hero: heroData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update hero content')
    }

    return data.data.hero
  }
}

const heroService = new HeroService()

export const getCurrentHeroContent = () => heroService.getCurrentHeroContent()
export const getHeroContent = () => heroService.getHeroContent()
export const updateHeroContent = (heroData: HeroContent | FormData) => heroService.updateHeroContent(heroData)