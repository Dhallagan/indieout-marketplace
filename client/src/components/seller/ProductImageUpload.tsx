import { useState, useRef } from 'react'
import { uploadImage, deleteImage, getImageUrl, getOptimizedUrl, validateImage, UploadResponse } from '@/services/uploadService'
import { productImageService } from '@/services/productImageService'

interface ProductImage {
  id?: string
  url?: string
  image_url?: string
  thumb_url?: string
  medium_url?: string
  large_url?: string
  position?: number
  alt_text?: string
}

interface ProductImageUploadProps {
  productId?: string  // If provided, uses product image management APIs
  images: (string | UploadResponse | ProductImage | null | undefined)[]
  onChange: (images: (string | UploadResponse | ProductImage | null | undefined)[]) => void
  maxImages?: number
  label?: string
  helpText?: string
}

export default function ProductImageUpload({ 
  productId,
  images, 
  onChange, 
  maxImages = 10, 
  label = "Product Images",
  helpText = "Upload high-quality images of your product. JPG, PNG, or WebP. Max 5MB per image." 
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadError(null)

    // Check if adding these files would exceed the max
    if (images.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)

    try {
      // Always use the existing upload service for image processing
      // If we have a productId, upload directly to product
      if (productId) {
        const uploadPromises = Array.from(files).map(async (file) => {
          // Validate file
          const validation = validateImage(file)
          if (!validation.valid) {
            throw new Error(validation.error)
          }

          // Upload directly as ProductImage
          const productImage = await productImageService.create(productId, {
            file,
            alt_text: ''
          })
          return productImage
        })

        const createdImages = await Promise.all(uploadPromises)
        onChange([...images, ...createdImages])
      } else {
        // For new products, use the upload service
        const uploadPromises = Array.from(files).map(async (file) => {
          // Validate file
          const validation = validateImage(file)
          if (!validation.valid) {
            throw new Error(validation.error)
          }

          // Upload file using existing service
          const result = await uploadImage(file)
          return result
        })

        const uploadedResponses = await Promise.all(uploadPromises)
        onChange([...images, ...uploadedResponses])
      }
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload images')
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    const image = images[index]
    setDeletingIndex(index)
    
    try {
      // If we have a productId and this is a ProductImage with an ID, use the ProductImage API
      if (productId && typeof image === 'object' && 'id' in image && image.id && 
          (('position' in image) || ('image_url' in image) || ('thumb_url' in image))) {
        // This is a ProductImage record - use the ProductImage API
        await productImageService.delete(productId, image.id)
      } else {
        // Use existing delete service for uploaded files
        if (typeof image === 'object' && 'id' in image && image.id) {
          // For UploadResponse objects, pass both ID and URL
          const imageUrl = 'url' in image ? image.url : (image as ProductImage).image_url
          await deleteImage(image.id, imageUrl)
        } else if (typeof image === 'string') {
          const filename = image.split('/').pop()
          if (filename) {
            // For string URLs, pass the full URL
            await deleteImage(filename, image)
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete image from server:', error)
      setUploadError('Failed to delete image. Please try again.')
      return
    } finally {
      setDeletingIndex(null)
    }

    // Remove from state
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const moveImage = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
    
    // If we have a productId, persist the reordering to the backend
    if (productId) {
      try {
        // Get all image IDs in the new order
        const imageIds = newImages
          .filter(img => img && typeof img === 'object' && 'id' in img && img.id)
          .map(img => (img as ProductImage).id)
          .filter(Boolean)
        
        if (imageIds.length > 0) {
          await productImageService.reorder(productId, imageIds)
        }
      } catch (error) {
        console.error('Failed to save image order:', error)
        setUploadError('Failed to save image order. Please refresh and try again.')
      }
    }
  }

  const getDisplayUrl = (image: string | UploadResponse | ProductImage | null | undefined): string => {
    // Handle null/undefined images
    if (!image) {
      return '/placeholder-product.svg'
    }
    
    if (typeof image === 'string') {
      return getImageUrl(image)
    } else if (typeof image === 'object') {
      // Check for ProductImage format
      if ('thumb_url' in image && image.thumb_url) {
        return image.thumb_url
      } else if ('image_url' in image && image.image_url) {
        return image.image_url
      } else if ('url' in image) {
        // UploadResponse format
        return getOptimizedUrl(image as UploadResponse, 'thumb')
      }
    }
    
    return '/placeholder-product.svg'
  }

  return (
    <div>
      <label className="block text-sm font-medium text-charcoal-700 mb-2">
        {label}
      </label>
      
      {/* Upload Button */}
      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
          className="inline-flex items-center px-4 py-2 border border-sand-300 rounded-xl text-sm font-medium text-charcoal-700 bg-white hover:bg-sand-50 focus:outline-none focus:ring-2 focus:ring-forest-500/20 focus:border-forest-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-charcoal-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Images
            </>
          )}
        </button>
        
        <span className="ml-3 text-sm text-charcoal-500">
          {images.length} / {maxImages} images
        </span>
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => {
            // Skip null/undefined images but keep index intact for deletion
            if (!image) {
              return null
            }
            
            const displayUrl = getDisplayUrl(image)
            const isDeleting = deletingIndex === index
            
            return (
              <div key={index} className="relative group">
                <div className="aspect-square bg-sand-100 rounded-xl overflow-hidden border border-sand-200/60">
                  <img
                    src={displayUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {isDeleting && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-charcoal-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
              
                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center space-x-2">
                  {/* Move Left */}
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      disabled={isDeleting}
                      className="p-2 bg-white rounded-lg text-charcoal-700 hover:bg-sand-50 shadow-sm disabled:opacity-50"
                      title="Move left"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveImage(index)}
                    disabled={isDeleting}
                    className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 shadow-sm disabled:opacity-50"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  {/* Move Right */}
                  {index < images.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      disabled={isDeleting}
                      className="p-2 bg-white rounded-lg text-charcoal-700 hover:bg-sand-50 shadow-sm disabled:opacity-50"
                      title="Move right"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
                
                {/* Primary Image Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-forest-600 text-white text-xs px-2 py-1 rounded-lg font-medium shadow-sm">
                    Primary
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Help Text */}
      {helpText && (
        <p className="text-sm text-charcoal-500">{helpText}</p>
      )}
    </div>
  )
}