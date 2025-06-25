require 'rails_helper'

RSpec.describe "Api::V1::Categories", type: :request do
  describe "GET /api/v1/categories" do
    it "returns http success" do
      get "/api/v1/categories"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /api/v1/categories/:id" do
    it "returns http not found for non-existent category" do
      get "/api/v1/categories/999"
      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/categories" do
    it "returns http unauthorized without authentication" do
      post "/api/v1/categories", params: {
        category: {
          name: "Test Category",
          description: "Test Description"
        }
      }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "PATCH /api/v1/categories/:id" do
    it "returns http unauthorized without authentication" do
      patch "/api/v1/categories/1", params: {
        category: {
          name: "Updated Category"
        }
      }
      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/categories/:id" do
    it "returns http unauthorized without authentication" do
      delete "/api/v1/categories/1"
      expect(response).to have_http_status(:unauthorized)
    end
  end
end