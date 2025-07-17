FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    first_name { "John" }
    last_name { "Doe" }
    role { :consumer }
    email_verified { true }
    email_verification_token { nil }
    password_reset_token { nil }
    password_reset_expires { nil }
    two_factor_secret { nil }
    two_factor_enabled { false }
    avatar { nil }
    phone { nil }
    date_of_birth { nil }
  end
end
