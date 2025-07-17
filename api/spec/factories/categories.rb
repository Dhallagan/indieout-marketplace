FactoryBot.define do
  factory :category do
    sequence(:name) { |n| "Category #{n}" }
    sequence(:slug) { |n| "category-#{n}" }
    description { "Test category description" }
    image { "category.png" }
    parent { nil }
  end
end