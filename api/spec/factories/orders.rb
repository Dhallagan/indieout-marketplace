FactoryBot.define do
  factory :order do
    user { nil }
    store { nil }
    status { "MyString" }
    order_number { "MyString" }
    subtotal { "9.99" }
    shipping_cost { "9.99" }
    tax_amount { "9.99" }
    total_amount { "9.99" }
    shipping_address { "MyText" }
    billing_address { "MyText" }
    payment_method { "MyString" }
    payment_status { "MyString" }
    payment_reference { "MyString" }
    notes { "MyText" }
    fulfilled_at { "2025-06-24 09:53:07" }
    cancelled_at { "2025-06-24 09:53:07" }
  end
end
