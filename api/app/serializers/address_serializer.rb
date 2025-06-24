class AddressSerializer
  include JSONAPI::Serializer
  
  attributes :id, :full_name, :address_line_1, :address_line_2, 
             :city, :state, :zip_code, :country, :phone, :is_default,
             :created_at, :updated_at
             
  attribute :formatted_address do |address|
    address.formatted_address
  end
  
  belongs_to :user
end