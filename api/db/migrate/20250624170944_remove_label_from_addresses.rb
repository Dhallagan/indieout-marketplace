class RemoveLabelFromAddresses < ActiveRecord::Migration[7.1]
  def change
    remove_column :addresses, :label, :string
  end
end
