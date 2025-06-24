FactoryBot.define do
  factory :address do
    user { nil }
    label { "MyString" }
    full_name { "MyString" }
    address_line_1 { "MyString" }
    address_line_2 { "MyString" }
    city { "MyString" }
    state { "MyString" }
    zip_code { "MyString" }
    country { "MyString" }
    phone { "MyString" }
    is_default { false }
  end
end
