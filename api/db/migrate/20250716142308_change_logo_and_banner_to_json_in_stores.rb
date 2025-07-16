class ChangeLogoAndBannerToJsonInStores < ActiveRecord::Migration[7.1]
  def up
    rename_column :stores, :logo, :logo_data
    rename_column :stores, :banner, :banner_data
    change_column :stores, :logo_data, :text
    change_column :stores, :banner_data, :text
  end

  def down
    change_column :stores, :logo_data, :string
    change_column :stores, :banner_data, :string
    rename_column :stores, :logo_data, :logo
    rename_column :stores, :banner_data, :banner
  end
end
