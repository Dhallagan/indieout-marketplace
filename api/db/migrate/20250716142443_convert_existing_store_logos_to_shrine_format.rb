class ConvertExistingStoreLogosToShrineFormat < ActiveRecord::Migration[7.1]
  def up
    # First, let's clear out the existing URL strings since they won't work with Shrine
    # These are external URLs that can't be managed by our storage system
    Store.where.not(logo_data: nil).update_all(logo_data: nil)
    Store.where.not(banner_data: nil).update_all(banner_data: nil)
    
    # Users will need to re-upload their images through the proper upload system
    puts "Cleared existing logo and banner URLs. Users will need to re-upload their images."
  end

  def down
    # No way to restore the old URLs
  end
end