class CreateOrderItems < ActiveRecord::Migration[7.1]
  def change
    create_table :order_items, id: :string do |t|
      t.references :order, null: false, foreign_key: true, type: :string
      t.references :product, null: false, foreign_key: true, type: :string
      t.integer :quantity, null: false
      t.decimal :unit_price, precision: 10, scale: 2, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      t.json :product_snapshot, null: false

      t.timestamps
    end
    
    add_index :order_items, [:order_id, :product_id], unique: true
  end
end
