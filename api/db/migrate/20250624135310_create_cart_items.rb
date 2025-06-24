class CreateCartItems < ActiveRecord::Migration[7.1]
  def change
    create_table :cart_items, id: :string do |t|
      t.references :cart, null: false, foreign_key: true, type: :string
      t.references :product, null: false, foreign_key: true, type: :string
      t.integer :quantity, null: false, default: 1
      t.datetime :added_at, null: false

      t.timestamps
    end
    
    add_index :cart_items, [:cart_id, :product_id], unique: true
  end
end