FactoryBot.define do
  factory :category do
    name { "MyString" }
    slug { "MyString" }
    description { "MyText" }
    image { "MyString" }
    parent { nil }
  end
end
