class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders, id: :string do |t|
      t.references :user, null: false, foreign_key: true, type: :string
      t.references :store, null: false, foreign_key: true, type: :string
      t.string :status, null: false, default: 'pending'
      t.string :order_number, null: false
      t.decimal :subtotal, precision: 10, scale: 2, null: false
      t.decimal :shipping_cost, precision: 10, scale: 2, default: 0
      t.decimal :tax_amount, precision: 10, scale: 2, default: 0
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.json :shipping_address, null: false
      t.json :billing_address
      t.string :payment_method
      t.string :payment_status, default: 'pending'
      t.string :payment_reference
      t.text :notes
      t.datetime :fulfilled_at
      t.datetime :cancelled_at

      t.timestamps
    end
    
    add_index :orders, :order_number, unique: true
    add_index :orders, :status
    add_index :orders, :payment_status
    add_index :orders, [:user_id, :created_at]
    add_index :orders, [:store_id, :created_at]
  end
end
