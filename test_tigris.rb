#!/usr/bin/env ruby

# Test script to verify Tigris storage is working

require 'aws-sdk-s3'
require 'dotenv'

# Load environment variables
Dotenv.load('.env')

# Configure S3 client for Tigris
client = Aws::S3::Client.new(
  access_key_id: ENV['AWS_ACCESS_KEY_ID'],
  secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'],
  endpoint: ENV['AWS_ENDPOINT_URL_S3'],
  region: ENV['AWS_REGION'],
  force_path_style: true
)

bucket_name = ENV['BUCKET_NAME']

puts "Testing Tigris storage connection..."
puts "Bucket: #{bucket_name}"
puts "Endpoint: #{ENV['AWS_ENDPOINT_URL_S3']}"

begin
  # List objects in the bucket
  resp = client.list_objects_v2(bucket: bucket_name)
  
  puts "\nSuccess! Connected to Tigris storage."
  puts "Objects in bucket: #{resp.key_count}"
  
  if resp.contents.any?
    puts "\nExisting objects:"
    resp.contents.each do |object|
      puts "  - #{object.key} (#{object.size} bytes)"
    end
  end
  
  # Create a test file
  test_key = "test/tigris-test-#{Time.now.to_i}.txt"
  test_content = "Hello from IndieOut! Testing Tigris storage at #{Time.now}"
  
  puts "\nUploading test file: #{test_key}"
  client.put_object(
    bucket: bucket_name,
    key: test_key,
    body: test_content
  )
  
  puts "Test file uploaded successfully!"
  
  # Read it back
  resp = client.get_object(bucket: bucket_name, key: test_key)
  content = resp.body.read
  
  puts "Content retrieved: #{content}"
  
  # Clean up
  client.delete_object(bucket: bucket_name, key: test_key)
  puts "Test file deleted."
  
rescue Aws::S3::Errors::ServiceError => e
  puts "\nError connecting to Tigris:"
  puts "  #{e.class}: #{e.message}"
  puts "\nPlease check your credentials and bucket configuration."
end