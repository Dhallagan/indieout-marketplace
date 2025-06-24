class CreateBanners < ActiveRecord::Migration[7.1]
  def change
    create_table :banners, id: :string do |t|
      t.string :title, null: false
      t.string :subtitle
      t.text :description
      t.string :cta_text
      t.string :cta_url
      t.string :background_image
      t.string :background_color, default: '#1a5f4a' # forest-600
      t.string :text_color, default: '#ffffff'
      t.integer :position, default: 0
      t.boolean :is_active, default: true, null: false
      t.datetime :start_date
      t.datetime :end_date
      t.string :created_by, null: false

      t.timestamps
    end

    add_index :banners, :position
    add_index :banners, :is_active
    add_index :banners, [:start_date, :end_date]
  end
end
