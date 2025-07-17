FactoryBot.define do
  factory :store do
    sequence(:name) { |n| "Store #{n}" }
    sequence(:slug) { |n| "store-#{n}" }
    description { "Test store description" }
    logo_data { nil }  # Don't set files in tests
    banner_data { nil }  # Don't set files in tests
    website { "https://example.com" }
    is_verified { true }
    is_active { true }
    commission_rate { 0.05 }
    association :owner, factory: :user
    total_sales { 0 }
    total_orders { 0 }
    rating { nil }
    review_count { 0 }
    verification_status { "approved" }
    email { nil }
    phone { nil }
  end
end