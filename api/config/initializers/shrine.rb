require "shrine"
require "shrine/storage/s3"
require "shrine/storage/file_system"

# Always use S3-compatible storage (Tigris on Fly.io) for all environments
s3_options = {
  access_key_id:     ENV.fetch("AWS_ACCESS_KEY_ID"),
  secret_access_key: ENV.fetch("AWS_SECRET_ACCESS_KEY"),
  endpoint:          ENV.fetch("AWS_ENDPOINT_URL_S3", "https://fly.storage.tigris.dev"),
  region:            ENV.fetch("AWS_REGION", "auto"),
  bucket:            ENV.fetch("BUCKET_NAME"),
  force_path_style:  true # Required for S3-compatible services
}

# Define different storage locations with short, non-descriptive prefixes
Shrine.storages = {
  # Temporary cache storage
  cache: Shrine::Storage::S3.new(prefix: "c", **s3_options),
  
  # Default store
  store: Shrine::Storage::S3.new(prefix: "d", **s3_options),
  
  # Product images (p/{store_id}/{product_id}/...)
  products: Shrine::Storage::S3.new(prefix: "p", **s3_options),
  
  # Admin/system images (hero, banners, etc)
  admin: Shrine::Storage::S3.new(prefix: "a", **s3_options),
  
  # User avatars
  avatars: Shrine::Storage::S3.new(prefix: "u", **s3_options),
  
  # Store branding (logos, banners)
  stores: Shrine::Storage::S3.new(prefix: "s", **s3_options)
}

Shrine.plugin :activerecord
Shrine.plugin :cached_attachment_data # for retaining the cached file across form redisplays
Shrine.plugin :restore_cached_data # re-extract metadata when attaching a cached file
Shrine.plugin :rack_file # for accepting Rack uploaded file hashes
Shrine.plugin :validation_helpers # for validating uploaded files
Shrine.plugin :determine_mime_type, analyzer: :marcel # for determining MIME type
Shrine.plugin :store_dimensions, analyzer: :ruby_vips # for storing image dimensions
Shrine.plugin :derivatives # for creating image derivatives (replaces processing, versions, delete_raw)

# Configure URL options for generating absolute URLs
# S3/Tigris provides full URLs in all environments
Shrine.plugin :url_options, 
  cache: { 
    public: true,
    expires_in: 24 * 60 * 60, # 24 hours for cache URLs
    host: ENV.fetch("CDN_HOST", nil)
  },
  store: { 
    public: true,
    expires_in: 7 * 24 * 60 * 60, # 7 days for store URLs
    host: ENV.fetch("CDN_HOST", nil)
  }

# Configure derivatives (thumbnails and optimized images)
Shrine.plugin :derivatives, create_on_promote: true

Shrine::Attacher.validate do
  # File size (5MB max)
  validate_max_size 5 * 1024 * 1024, message: "must not be larger than 5MB"
  
  # File type
  validate_mime_type %w[image/jpeg image/jpg image/png image/webp], 
                     message: "must be a JPEG, PNG, or WebP image"
  
  # Image dimensions (optional - ensure reasonable sizes)
  validate_max_dimensions [5000, 5000], message: "must not be larger than 5000x5000 pixels"
end