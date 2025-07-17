FactoryBot.define do
  factory :product_image do
    product
    sequence(:position) { |n| n }
    alt_text { "Product image" }
    image_data { { "id" => "test_image_id", "storage" => "local", "metadata" => { "filename" => "test.jpg", "size" => 1024, "mime_type" => "image/jpeg" } }.to_json }
  end
end