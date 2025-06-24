import type { Banner, CreateBannerData, UpdateBannerData } from '@/types/api-generated';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

class BannerService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Public endpoints (no auth required)
  async getPublicBanners(): Promise<Banner[]> {
    const response = await fetch(`${API_BASE_URL}/public/banners`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch banners')
    }

    return data.data.banners
  }

  // Admin endpoints (auth required)
  async getBanners(): Promise<Banner[]> {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch banners')
    }

    return data.data.banners
  }

  async getBanner(id: string): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch banner')
    }

    return data.data.banner
  }

  async createBanner(bannerData: CreateBannerData): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ banner: bannerData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create banner')
    }

    return data.data.banner
  }

  async updateBanner(id: string, bannerData: UpdateBannerData): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ banner: bannerData }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update banner')
    }

    return data.data.banner
  }

  async deleteBanner(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete banner')
    }
  }
}

const bannerService = new BannerService()

export const getPublicBanners = () => bannerService.getPublicBanners()
export const getBanners = () => bannerService.getBanners()
export const getBanner = (id: string) => bannerService.getBanner(id)
export const createBanner = (bannerData: CreateBannerData) => bannerService.createBanner(bannerData)
export const updateBanner = (id: string, bannerData: UpdateBannerData) => bannerService.updateBanner(id, bannerData)
export const deleteBanner = (id: string) => bannerService.deleteBanner(id)