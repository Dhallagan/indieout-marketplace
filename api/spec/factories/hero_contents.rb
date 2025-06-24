FactoryBot.define do
  factory :hero_content do
    title { "MyString" }
    subtitle { "MyString" }
    description { "MyText" }
    cta_primary_text { "MyString" }
    cta_primary_url { "MyString" }
    cta_secondary_text { "MyString" }
    cta_secondary_url { "MyString" }
    background_image { "MyString" }
    is_active { false }
  end
end
