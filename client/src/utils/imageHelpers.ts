// Helper function to get the correct image URL
export function getProductImageUrl(image?: string | null): string {
  if (!image) return '/placeholder-product.svg'
  
  // If it's already an absolute URL, return as is
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }
  
  // If it's a relative path starting with /, prepend the API URL
  if (image.startsWith('/')) {
    return `http://localhost:5000${image}`
  }
  
  // Otherwise assume it's a relative path
  return `http://localhost:5000/${image}`
}