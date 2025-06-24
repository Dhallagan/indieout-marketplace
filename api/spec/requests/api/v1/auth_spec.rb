require 'rails_helper'

RSpec.describe "Api::V1::Auths", type: :request do
  describe "GET /register" do
    it "returns http success" do
      get "/api/v1/auth/register"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /login" do
    it "returns http success" do
      get "/api/v1/auth/login"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /me" do
    it "returns http success" do
      get "/api/v1/auth/me"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /verify_email" do
    it "returns http success" do
      get "/api/v1/auth/verify_email"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /forgot_password" do
    it "returns http success" do
      get "/api/v1/auth/forgot_password"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /reset_password" do
    it "returns http success" do
      get "/api/v1/auth/reset_password"
      expect(response).to have_http_status(:success)
    end
  end

end
