class CreateProductImages < ActiveRecord::Migration[7.1]
  def change
    create_table :product_images, id: :string do |t|
      t.string :product_id, null: false
      t.integer :position
      t.string :alt_text
      t.text :image_data

      t.timestamps
    end
    
    add_index :product_images, :product_id
    add_index :product_images, [:product_id, :position], unique: true
    add_foreign_key :product_images, :products
  end
end
