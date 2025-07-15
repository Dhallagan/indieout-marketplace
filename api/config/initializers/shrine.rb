require "shrine"
require "shrine/storage/s3"
require "shrine/storage/file_system"

# For development/test, we'll use filesystem storage
# For production, we'll use S3-compatible storage (Tigris on Fly.io)
if Rails.env.production?
  s3_options = {
    access_key_id:     ENV.fetch("AWS_ACCESS_KEY_ID"),
    secret_access_key: ENV.fetch("AWS_SECRET_ACCESS_KEY"),
    endpoint:          ENV.fetch("AWS_ENDPOINT_URL_S3", "https://fly.storage.tigris.dev"),
    region:            ENV.fetch("AWS_REGION", "auto"),
    bucket:            ENV.fetch("BUCKET_NAME"),
    force_path_style:  true # Required for S3-compatible services
  }

  Shrine.storages = {
    cache: Shrine::Storage::S3.new(prefix: "cache", **s3_options),
    store: Shrine::Storage::S3.new(prefix: "store", **s3_options)
  }
else
  # Development/test using local filesystem
  Shrine.storages = {
    cache: Shrine::Storage::FileSystem.new("public", prefix: "uploads/cache"),
    store: Shrine::Storage::FileSystem.new("public", prefix: "uploads/store")
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
if Rails.env.production?
  # In production, S3 provides full URLs
  Shrine.plugin :url_options, store: { 
    public: true,
    host: ENV.fetch("CDN_HOST", nil) # Optional CDN host
  }
else
  # In development/test, we need to provide host for file system storage
  host_with_port = if Rails.application.routes.default_url_options[:host]
    port = Rails.application.routes.default_url_options[:port]
    host = Rails.application.routes.default_url_options[:host]
    "http://#{host}#{port ? ":#{port}" : ""}"
  else
    ENV.fetch('RAILS_HOST', 'http://localhost:5000')
  end
  
  Shrine.plugin :url_options, store: { host: host_with_port }
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