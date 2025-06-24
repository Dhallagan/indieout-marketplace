class AddVerificationStatusToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :verification_status, :string, default: 'pending'
    add_column :stores, :email, :string
    add_column :stores, :phone, :string
    
    # Add index for quick filtering
    add_index :stores, :verification_status
    
    # Update existing stores to have proper verification status
    reversible do |dir|
      dir.up do
        Store.update_all(verification_status: 'pending')
        Store.where(is_verified: true).update_all(verification_status: 'verified')
      end
    end
  end
end