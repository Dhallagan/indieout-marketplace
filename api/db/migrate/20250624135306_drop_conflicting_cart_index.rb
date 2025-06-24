class DropConflictingCartIndex < ActiveRecord::Migration[7.1]
  def change
    # Drop the conflicting index if it exists
    execute "DROP INDEX IF EXISTS index_carts_on_user_id;"
    execute "DROP INDEX IF EXISTS index_carts_on_expires_at;"
  end
end