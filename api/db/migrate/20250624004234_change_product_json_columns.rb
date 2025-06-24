class ChangeProductJsonColumns < ActiveRecord::Migration[7.1]
  def up
    # Convert text columns storing JSON to proper JSON columns
    change_column :products, :materials, :json, using: 'materials::json'
    change_column :products, :images, :json, using: 'images::json'
    change_column :products, :videos, :json, using: 'videos::json'
  end

  def down
    # Revert back to text columns
    change_column :products, :materials, :text
    change_column :products, :images, :text
    change_column :products, :videos, :text
  end
end
