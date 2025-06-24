FactoryBot.define do
  factory :user do
    email { "MyString" }
    password_digest { "MyString" }
    first_name { "MyString" }
    last_name { "MyString" }
    role { 1 }
    email_verified { false }
    email_verification_token { "MyString" }
    password_reset_token { "MyString" }
    password_reset_expires { "2025-06-23 11:57:18" }
    two_factor_secret { "MyString" }
    two_factor_enabled { false }
    avatar { "MyString" }
    phone { "MyString" }
    date_of_birth { "2025-06-23" }
  end
end
