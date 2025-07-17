require 'rails_helper'

RSpec.describe "Guest Checkout", type: :request do
  let(:product) { create(:product, :with_images) }
  let(:headers) { { 'Content-Type' => 'application/json' } }
  
  describe "POST /api/v1/orders" do
    context "when user is not authenticated (guest checkout)" do
      let(:valid_params) do
        {
          order: {
            email: "guest@example.com",
            payment_method: "card",
            shipping_address: {
              firstName: "John",
              lastName: "Doe",
              email: "guest@example.com",
              phone: "555-1234",
              address1: "123 Main St",
              address2: "",
              city: "Anytown",
              state: "CA",
              zipCode: "12345",
              country: "US"
            },
            billing_address: {
              firstName: "John",
              lastName: "Doe",
              email: "guest@example.com",
              phone: "555-1234",
              address1: "123 Main St",
              address2: "",
              city: "Anytown",
              state: "CA",
              zipCode: "12345",
              country: "US"
            },
            cart_items: [
              {
                product_id: product.id,
                quantity: 2
              }
            ]
          }
        }
      end

      it "creates an order for guest user" do
        expect {
          post "/api/v1/orders", params: valid_params.to_json, headers: headers
        }.to change(Order, :count).by(1)
          .and change(User, :count).by(1) # Guest user created
          .and change(OrderItem, :count).by(1)
        
        expect(response).to have_http_status(:created)
        
        json = JSON.parse(response.body)
        expect(json['data']).to be_an(Array)
        expect(json['data'].first['attributes']['status']).to eq('pending')
        
        # Verify order items have product snapshots with images
        order = Order.last
        expect(order.order_items.first.product_snapshot).to have_key('images')
        expect(order.order_items.first.product_snapshot['images']).to be_an(Array)
      end

      it "validates required address fields" do
        invalid_params = valid_params.deep_dup
        invalid_params[:order][:shipping_address].delete(:city)
        
        post "/api/v1/orders", params: invalid_params.to_json, headers: headers
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Invalid shipping address')
      end

      it "validates email is provided" do
        invalid_params = valid_params.deep_dup
        invalid_params[:order].delete(:email)
        
        post "/api/v1/orders", params: invalid_params.to_json, headers: headers
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Email is required for guest checkout')
      end

      it "validates cart items are provided" do
        invalid_params = valid_params.deep_dup
        invalid_params[:order][:cart_items] = []
        
        post "/api/v1/orders", params: invalid_params.to_json, headers: headers
        
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['error']).to eq('Cart items are required for guest checkout')
      end

      it "handles multiple products from different stores" do
        product2 = create(:product, :with_images, store: create(:store))
        
        params_with_multiple = valid_params.deep_dup
        params_with_multiple[:order][:cart_items] << {
          product_id: product2.id,
          quantity: 1
        }
        
        expect {
          post "/api/v1/orders", params: params_with_multiple.to_json, headers: headers
        }.to change(Order, :count).by(2) # One order per store
        
        expect(response).to have_http_status(:created)
      end
    end
  end
end