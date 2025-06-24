class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products, id: :string do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description, null: false
      t.text :short_description
      t.decimal :base_price, precision: 10, scale: 2, null: false
      t.decimal :compare_at_price, precision: 10, scale: 2
      t.string :sku
      t.boolean :track_inventory, default: true, null: false
      t.integer :inventory, default: 0, null: false
      t.integer :low_stock_threshold, default: 5, null: false
      t.decimal :weight, precision: 8, scale: 2
      t.string :dimensions
      t.text :materials # JSON stored as text
      t.text :images    # JSON stored as text
      t.text :videos    # JSON stored as text
      t.string :meta_title
      t.text :meta_description
      t.integer :status, default: 0, null: false # 0: draft, 1: pending_approval, 2: active, 3: inactive, 4: rejected
      t.boolean :is_featured, default: false, null: false
      t.string :store_id, null: false
      t.string :category_id, null: false

      t.timestamps
    end

    add_index :products, :slug, unique: true
    add_index :products, :store_id
    add_index :products, :category_id
    add_index :products, :status
    add_index :products, :is_featured
    add_foreign_key :products, :stores, column: :store_id
    add_foreign_key :products, :categories, column: :category_id
  end
end
