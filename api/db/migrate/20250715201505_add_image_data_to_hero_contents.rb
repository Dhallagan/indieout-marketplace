class AddImageDataToHeroContents < ActiveRecord::Migration[7.1]
  def change
    add_column :hero_contents, :background_image_data, :text
    add_column :hero_contents, :featured_collection_image_data, :text
  end
end
