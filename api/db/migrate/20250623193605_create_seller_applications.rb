class CreateSellerApplications < ActiveRecord::Migration[7.1]
  def change
    create_table :seller_applications do |t|
      t.string :email
      t.string :first_name
      t.string :last_name
      t.string :phone
      t.string :business_name
      t.integer :business_type
      t.text :business_description
      t.text :brand_story
      t.string :years_in_business
      t.string :website_url
      t.text :social_media_links
      t.text :product_categories
      t.text :product_description
      t.text :manufacturing_process
      t.text :materials_sourced
      t.string :production_location
      t.text :sustainability_practices
      t.text :target_audience
      t.string :tax_id
      t.text :business_address
      t.text :shipping_locations
      t.text :previous_marketplace_experience
      t.text :references
      t.integer :status
      t.datetime :approved_at
      t.datetime :rejected_at
      t.datetime :reviewed_at
      t.text :rejection_reason
      t.string :user_id

      t.timestamps
    end
    add_index :seller_applications, :status
  end
end
