require 'rails_helper'

RSpec.describe "Api::V1::Auths", type: :request do
  describe "POST /register" do
    it "returns http unprocessable_entity without valid params" do
      post "/api/v1/auth/register", params: {
        user: {
          email: "",
          password: "short",
          password_confirmation: "different",
          first_name: "",
          last_name: ""
        }
      }
      expect(response).to have_http_status(:unprocessable_entity)
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
    it "returns http bad_request with invalid token" do
      post "/api/v1/auth/verify_email", params: { token: "invalid" }
      expect(response).to have_http_status(:bad_request)
    end
  end

  describe "POST /forgot_password" do
    it "returns http ok even without email" do
      post "/api/v1/auth/forgot_password", params: { email: "" }
      expect(response).to have_http_status(:ok)
    end
  end

  describe "POST /reset_password" do
    it "returns http bad_request with invalid token" do
      post "/api/v1/auth/reset_password", params: {
        token: "invalid",
        password: "newpassword123",
        password_confirmation: "newpassword123"
      }
      expect(response).to have_http_status(:bad_request)
    end
  end
end