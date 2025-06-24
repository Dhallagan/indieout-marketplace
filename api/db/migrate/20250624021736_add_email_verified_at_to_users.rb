class AddEmailVerifiedAtToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :email_verified_at, :datetime
    
    # Update existing verified users
    reversible do |dir|
      dir.up do
        User.where(email_verified: true).update_all(email_verified_at: Time.current)
      end
    end
  end
end