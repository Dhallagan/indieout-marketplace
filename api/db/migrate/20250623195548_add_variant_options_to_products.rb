class AddVariantOptionsToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :option1_name, :string
    add_column :products, :option2_name, :string
    add_column :products, :option3_name, :string
  end
end
