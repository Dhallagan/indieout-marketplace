class CreateCarts < ActiveRecord::Migration[7.1]
  def change
    create_table :carts, id: :string do |t|
      t.references :user, null: false, foreign_key: true, type: :string
      t.datetime :expires_at, null: false

      t.timestamps
    end
    
    add_index :carts, :user_id, unique: true, if_not_exists: true
    add_index :carts, :expires_at, if_not_exists: true
  end
end