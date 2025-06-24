class CreateAddresses < ActiveRecord::Migration[7.1]
  def change
    create_table :addresses, id: :string do |t|
      t.string :user_id, null: false
      t.string :label, null: false
      t.string :full_name, null: false
      t.string :address_line_1, null: false
      t.string :address_line_2
      t.string :city, null: false
      t.string :state, null: false
      t.string :zip_code, null: false
      t.string :country, default: 'US', null: false
      t.string :phone
      t.boolean :is_default, default: false, null: false

      t.timestamps
    end
    
    add_foreign_key :addresses, :users, column: :user_id, type: :string
    add_index :addresses, :user_id
    add_index :addresses, [:user_id, :is_default]
  end
end
