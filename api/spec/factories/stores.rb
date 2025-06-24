FactoryBot.define do
  factory :store do
    name { "MyString" }
    slug { "MyString" }
    description { "MyText" }
    logo { "MyString" }
    banner { "MyString" }
    website { "MyString" }
    is_verified { false }
    is_active { false }
    commission_rate { "9.99" }
    owner { nil }
    total_sales { "9.99" }
    total_orders { 1 }
    rating { "9.99" }
    review_count { 1 }
  end
end
