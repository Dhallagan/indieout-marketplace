# Test Shrine with Tigris storage
require 'tempfile'
require 'open-uri'

puts "Testing Shrine with Tigris storage..."

# Check Shrine configuration
puts "\nShrine storages configured:"
puts "- Cache: #{Shrine.storages[:cache].class}"
puts "- Store: #{Shrine.storages[:store].class}"

# Create a test file
tempfile = Tempfile.new(['test', '.txt'])
tempfile.write("Hello from Shrine! Testing Tigris storage at #{Time.now}")
tempfile.rewind

# Upload to cache
uploaded_file = Shrine.upload(tempfile, :cache)
puts "\nFile uploaded to cache:"
puts "- ID: #{uploaded_file.id}"
puts "- Storage: #{uploaded_file.storage_key}"
puts "- URL: #{uploaded_file.url}"

# Promote to store
stored_file = uploaded_file.promote
puts "\nFile promoted to store:"
puts "- ID: #{stored_file.id}"
puts "- Storage: #{stored_file.storage_key}"
puts "- URL: #{stored_file.url}"

# Read content back
content = stored_file.download.read
puts "\nContent retrieved: #{content}"

# Clean up
stored_file.delete
uploaded_file.delete
tempfile.close
tempfile.unlink

puts "\nTest completed successfully!"