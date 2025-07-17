FactoryBot.define do
  factory :product do
    sequence(:name) { |n| "Product #{n}" }
    sequence(:slug) { |n| "product-#{n}" }
    description { "This is a test product description" }
    short_description { "Test product" }
    base_price { 99.99 }
    compare_at_price { 129.99 }
    sequence(:sku) { |n| "SKU-#{n}" }
    track_inventory { true }
    inventory { 100 }
    low_stock_threshold { 10 }
    weight { 2.5 }
    dimensions { "10x10x10" }
    materials { ["Cotton", "Polyester"] }
    meta_title { "Test Product" }
    meta_description { "Test product description" }
    status { "active" }
    is_featured { false }
    store
    category

    trait :with_images do
      after(:create) do |product|
        create_list(:product_image, 3, product: product)
      end
    end

    trait :featured do
      is_featured { true }
    end

    trait :out_of_stock do
      inventory { 0 }
    end
  end
end