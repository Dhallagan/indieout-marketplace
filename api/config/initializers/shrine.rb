require "shrine"
require "shrine/storage/s3"
require "shrine/storage/file_system"
require "image_processing/vips"

# Check if S3 credentials are available
if ENV["AWS_ACCESS_KEY_ID"] && ENV["AWS_SECRET_ACCESS_KEY"] && ENV["BUCKET_NAME"]
  # Use S3-compatible storage (Tigris on Fly.io) when credentials are available
  s3_options = {
    access_key_id:     ENV["AWS_ACCESS_KEY_ID"],
    secret_access_key: ENV["AWS_SECRET_ACCESS_KEY"],
    endpoint:          ENV.fetch("AWS_ENDPOINT_URL_S3", "https://fly.storage.tigris.dev"),
    region:            ENV.fetch("AWS_REGION", "auto"),
    bucket:            ENV["BUCKET_NAME"],
    force_path_style:  true # Required for S3-compatible services
  }
else
  # Fallback to local file storage when S3 credentials are not available
  Rails.logger.warn "S3 credentials not found. Using local file storage for uploads."
  s3_options = nil
end

# Define different storage locations
if s3_options
  # Use S3 storage when credentials are available
  # Add public-read ACL for all uploads to the public bucket
  upload_options = { acl: "public-read" }
  
  Shrine.storages = {
    # Temporary cache storage
    cache: Shrine::Storage::S3.new(prefix: "c", upload_options: upload_options, **s3_options),
    
    # Default store
    store: Shrine::Storage::S3.new(prefix: "d", upload_options: upload_options, **s3_options),
    
    # Product images (p/{store_id}/{product_id}/...)
    products: Shrine::Storage::S3.new(prefix: "p", upload_options: upload_options, **s3_options),
    
    # Admin/system images (hero, banners, etc)
    admin: Shrine::Storage::S3.new(prefix: "a", upload_options: upload_options, **s3_options),
    
    # User avatars
    avatars: Shrine::Storage::S3.new(prefix: "u", upload_options: upload_options, **s3_options),
    
    # Store branding (logos, banners)
    stores: Shrine::Storage::S3.new(prefix: "s", upload_options: upload_options, **s3_options)
  }
else
  # Use local file storage as fallback
  Shrine.storages = {
    cache: Shrine::Storage::FileSystem.new("public", prefix: "uploads/cache"),
    store: Shrine::Storage::FileSystem.new("public", prefix: "uploads/store"),
    products: Shrine::Storage::FileSystem.new("public", prefix: "uploads/products"),
    admin: Shrine::Storage::FileSystem.new("public", prefix: "uploads/admin"),
    avatars: Shrine::Storage::FileSystem.new("public", prefix: "uploads/avatars"),
    stores: Shrine::Storage::FileSystem.new("public", prefix: "uploads/stores")
  }
end

Shrine.plugin :activerecord
Shrine.plugin :cached_attachment_data # for retaining the cached file across form redisplays
Shrine.plugin :restore_cached_data # re-extract metadata when attaching a cached file
Shrine.plugin :rack_file # for accepting Rack uploaded file hashes
Shrine.plugin :validation_helpers # for validating uploaded files
Shrine.plugin :determine_mime_type, analyzer: :marcel # for determining MIME type
Shrine.plugin :store_dimensions, analyzer: :ruby_vips # for storing image dimensions
Shrine.plugin :derivatives # for creating image derivatives (replaces processing, versions, delete_raw)

# Configure URL options for generating absolute URLs
if s3_options
  # Tigris doesn't support public buckets, so we use presigned URLs
  # Remove public: true to ensure presigned URLs are generated
  Shrine.plugin :url_options, 
    cache: { 
      host: ENV.fetch("CDN_URL", "https://fly.storage.tigris.dev"),
    },
    store: { 
      host: ENV.fetch("CDN_URL", "https://fly.storage.tigris.dev"),
    }
else
  # For local file storage, we need to set the host for absolute URLs
  host = ENV.fetch("RAILS_HOST", "http://localhost:5000")
  Shrine.plugin :url_options, 
    cache: { 
      public: true,
      host: host
    },
    store: { 
      public: true,
      host: host
    }
end

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