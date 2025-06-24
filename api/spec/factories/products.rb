FactoryBot.define do
  factory :product do
    name { "MyString" }
    slug { "MyString" }
    description { "MyText" }
    short_description { "MyText" }
    base_price { "9.99" }
    compare_at_price { "9.99" }
    sku { "MyString" }
    track_inventory { false }
    inventory { 1 }
    low_stock_threshold { 1 }
    weight { "9.99" }
    dimensions { "MyString" }
    materials { "MyText" }
    images { "MyText" }
    videos { "MyText" }
    meta_title { "MyString" }
    meta_description { "MyText" }
    status { 1 }
    is_featured { false }
    store { nil }
    category { nil }
  end
end
