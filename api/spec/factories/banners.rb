FactoryBot.define do
  factory :banner do
    title { "MyString" }
    subtitle { "MyString" }
    description { "MyText" }
    cta_text { "MyString" }
    cta_url { "MyString" }
    background_image { "MyString" }
    background_color { "MyString" }
    text_color { "MyString" }
    position { 1 }
    is_active { false }
    start_date { "2025-06-23 21:05:11" }
    end_date { "2025-06-23 21:05:11" }
    created_by { "MyString" }
  end
end
