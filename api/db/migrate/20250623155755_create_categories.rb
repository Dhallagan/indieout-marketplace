class CreateCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :categories, id: :string do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.string :image
      t.string :parent_id

      t.timestamps
    end

    add_index :categories, :slug, unique: true
    add_index :categories, :parent_id
    add_foreign_key :categories, :categories, column: :parent_id
  end
end
