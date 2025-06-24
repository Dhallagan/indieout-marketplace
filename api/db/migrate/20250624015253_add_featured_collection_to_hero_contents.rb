class AddFeaturedCollectionToHeroContents < ActiveRecord::Migration[7.1]
  def change
    add_column :hero_contents, :featured_collection_title, :string
    add_column :hero_contents, :featured_collection_subtitle, :string
    add_column :hero_contents, :featured_collection_image, :string
  end
end
