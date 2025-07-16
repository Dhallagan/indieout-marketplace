import { useState, useRef } from 'react'
import { uploadImage, deleteImage, getImageUrl, getOptimizedUrl, validateImage, UploadResponse } from '@/services/uploadService'
import Button from './Button'

interface LogoData {
  thumb?: string
  medium?: string
  large?: string
  original?: string
}

interface ImageUploadProps {
  images: (string | UploadResponse | LogoData)[]
  onChange: (images: (string | UploadResponse | LogoData)[]) => void
  maxImages?: number
  label?: string
  helpText?: string
}

export default function ImageUpload({ 
  images, 
  onChange, 
  maxImages = 10, 
  label = "Product Images",
  helpText = "Upload high-quality images of your product. JPG, PNG, or WebP. Max 5MB per image." 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploadError(null)

    // For single image uploads (like logos), replace the existing image
    if (maxImages === 1 && files.length > 0) {
      // We'll replace the existing image, so we only process the first file
      const file = files[0]
      setIsUploading(true)

      try {
        // Validate file
        const validation = validateImage(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Upload file
        const result = await uploadImage(file)
        
        // Replace the entire array with just the new upload
        onChange([result])
      } catch (error: any) {
        setUploadError(error.message || 'Failed to upload image')
      } finally {
        setIsUploading(false)
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      return
    }

    // Check if adding these files would exceed the max (for multi-image uploads)
    if (images.length + files.length > maxImages) {
      setUploadError(`Maximum ${maxImages} images allowed`)
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file
        const validation = validateImage(file)
        if (!validation.valid) {
          throw new Error(validation.error)
        }

        // Upload file
        const result = await uploadImage(file)
        return result
      })

      const uploadedResponses = await Promise.all(uploadPromises)
      onChange([...images, ...uploadedResponses])
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
    
    try {
      // For new uploads (UploadResponse objects), use the ID
      // For legacy URLs (strings), extract filename
      if (typeof image === 'object' && 'id' in image && image.id) {
        await deleteImage(image.id)
      } else if (typeof image === 'string') {
        const filename = image.split('/').pop()
        if (filename) {
          await deleteImage(filename)
        }
      } else if (typeof image === 'object' && !('id' in image)) {
        // LogoData - we can't delete this from here as it's already attached to the store
        console.log('Cannot delete logo from here - update store to remove logo')
      }
    } catch (error) {
      console.error('Failed to delete image from server:', error)
      // Continue with removal from UI even if server deletion fails
    }

    // Remove from state
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
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
        
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          loading={isUploading}
          icon={
            images.length > 0 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            )
          }
        >
          {isUploading ? 'Uploading...' : images.length > 0 ? 'Replace' : maxImages === 1 ? 'Add Image' : 'Add Images'}
        </Button>
        
        {maxImages > 1 && (
          <span className="ml-3 text-sm text-gray-500">
            {images.length} / {maxImages} images
          </span>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => {
            // Get the appropriate URL for display
            let displayUrl: string
            if (typeof image === 'string') {
              displayUrl = getImageUrl(image)
            } else if ('url' in image) {
              // UploadResponse
              displayUrl = getOptimizedUrl(image, 'thumb')
            } else {
              // LogoData
              displayUrl = getImageUrl(image.thumb || image.medium || image.large || image.original || '')
            }
            
            return (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={displayUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                {/* Move Left */}
                {index > 0 && (
                  <button
                    onClick={() => moveImage(index, index - 1)}
                    className="p-1 bg-white rounded text-gray-700 hover:bg-gray-100"
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
                  className="p-1 bg-red-600 rounded text-white hover:bg-red-700"
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
                    className="p-1 bg-white rounded text-gray-700 hover:bg-gray-100"
                    title="Move right"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Primary/Logo Badge */}
              {index === 0 && maxImages > 1 && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
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
        <p className="text-sm text-gray-500">{helpText}</p>
      )}
    </div>
  )
}