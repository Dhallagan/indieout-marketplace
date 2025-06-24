class CreateProductVariants < ActiveRecord::Migration[7.1]
  def change
    create_table :product_variants, id: :string do |t|
      t.string :product_id, null: false
      t.string :option1_value
      t.string :option2_value
      t.string :option3_value
      t.decimal :price, precision: 10, scale: 2, null: false
      t.integer :inventory, default: 0, null: false
      t.string :sku
      t.decimal :weight, precision: 8, scale: 2
      t.string :dimensions

      t.timestamps
    end
    
    add_index :product_variants, :product_id
    add_index :product_variants, :sku, unique: true
    add_index :product_variants, [:product_id, :option1_value, :option2_value, :option3_value], 
              unique: true, name: 'index_product_variants_on_unique_options'
    add_foreign_key :product_variants, :products
  end
end
