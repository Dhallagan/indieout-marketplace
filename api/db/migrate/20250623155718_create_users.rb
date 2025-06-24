class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :string do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.integer :role, default: 0, null: false # 0: consumer, 1: seller_admin, 2: system_admin
      t.boolean :email_verified, default: false, null: false
      t.string :email_verification_token
      t.string :password_reset_token
      t.datetime :password_reset_expires
      t.string :two_factor_secret
      t.boolean :two_factor_enabled, default: false, null: false
      t.string :avatar
      t.string :phone
      t.date :date_of_birth

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :email_verification_token
    add_index :users, :password_reset_token
  end
end
