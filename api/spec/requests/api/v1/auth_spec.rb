require 'rails_helper'

RSpec.describe "Api::V1::Auths", type: :request do
  describe "POST /register" do
    it "returns http success" do
      post "/api/v1/auth/register", params: {
        user: {
          email: "test@example.com",
          password: "password123",
          password_confirmation: "password123",
          first_name: "Test",
          last_name: "User"
        }
      }
      expect(response).to have_http_status(:created)
    end
  end

  describe "POST /login" do
    it "returns http unauthorized without valid credentials" do
      post "/api/v1/auth/login", params: {
        email: "test@example.com",
        password: "wrongpassword"
      }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "GET /me" do
    it "returns http unauthorized without token" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "POST /verify_email" do
    it "returns http unprocessable_entity without token" do
      post "/api/v1/auth/verify_email", params: { token: "" }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /forgot_password" do
    it "returns http unprocessable_entity without email" do
      post "/api/v1/auth/forgot_password", params: { email: "" }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "POST /reset_password" do
    it "returns http unprocessable_entity without token" do
      post "/api/v1/auth/reset_password", params: {
        token: "",
        password: "newpassword",
        password_confirmation: "newpassword"
      }
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end
end