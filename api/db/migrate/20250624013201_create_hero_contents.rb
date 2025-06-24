class CreateHeroContents < ActiveRecord::Migration[7.1]
  def change
    create_table :hero_contents do |t|
      t.string :title
      t.string :subtitle
      t.text :description
      t.string :cta_primary_text
      t.string :cta_primary_url
      t.string :cta_secondary_text
      t.string :cta_secondary_url
      t.string :background_image
      t.boolean :is_active

      t.timestamps
    end
  end
end
