class CategorySerializer
  include JSONAPI::Serializer

  attributes :id, :name, :slug, :description, :image, :parent_id, :created_at, :updated_at

  attribute :children do |category|
    if category.children.loaded?
      category.children.map do |child|
        CategorySerializer.new(child).serializable_hash[:data][:attributes]
      end
    else
      []
    end
  end

  attribute :parent do |category|
    if category.parent
      {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug
      }
    end
  end

  attribute :full_path do |category|
    category.full_path
  end

  attribute :depth do |category|
    category.depth
  end

  attribute :top_level do |category|
    category.top_level?
  end

  attribute :has_children do |category|
    category.has_children?
  end

  attribute :product_count do |category|
    if category.instance_variable_defined?(:@products_count)
      category.instance_variable_get(:@products_count)
    elsif category.respond_to?(:products_count)
      category.products_count
    else
      category.products.count
    end
  end
end