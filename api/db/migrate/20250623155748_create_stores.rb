class CreateStores < ActiveRecord::Migration[7.1]
  def change
    create_table :stores, id: :string do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :logo
      t.string :banner
      t.string :website
      t.boolean :is_verified, default: false, null: false
      t.boolean :is_active, default: true, null: false
      t.decimal :commission_rate, precision: 5, scale: 4, default: 0.05, null: false
      t.string :owner_id, null: false
      t.decimal :total_sales, precision: 12, scale: 2, default: 0.0, null: false
      t.integer :total_orders, default: 0, null: false
      t.decimal :rating, precision: 3, scale: 2
      t.integer :review_count, default: 0, null: false

      t.timestamps
    end

    add_index :stores, :slug, unique: true
    add_index :stores, :owner_id, unique: true
    add_foreign_key :stores, :users, column: :owner_id
  end
end
