require "shrine"
require "shrine/storage/s3"
require "shrine/storage/file_system"

# For development/test, we'll use filesystem storage
# For production, we'll use S3
if Rails.env.production?
  s3_options = {
    bucket: ENV.fetch("AWS_S3_BUCKET"),
    region: ENV.fetch("AWS_S3_REGION", "us-east-1"),
    access_key_id: ENV.fetch("AWS_ACCESS_KEY_ID"),
    secret_access_key: ENV.fetch("AWS_SECRET_ACCESS_KEY")
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
Shrine.plugin :url_options, store: -> {
  if Rails.application.routes.default_url_options[:host]
    port = Rails.application.routes.default_url_options[:port]
    host = Rails.application.routes.default_url_options[:host]
    { host: "http://#{host}#{port ? ":#{port}" : ""}" }
  else
    { host: ENV.fetch('RAILS_HOST', 'http://localhost:5000') }
  end
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