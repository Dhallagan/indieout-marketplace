class Api::V1::CategoriesController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :ensure_admin!, only: [:create, :update, :destroy]
  before_action :set_category, only: [:show, :update, :destroy]

  def index
    # Load categories with children only (no products)
    categories = Category.top_level.includes(children: :children)
    
    # Get all product counts in one query
    product_counts = Product.group(:category_id).count
    
    # Attach product counts to all categories
    all_categories = []
    categories.each do |category|
      all_categories << category
      category.instance_variable_set(:@products_count, product_counts[category.id] || 0)
      
      if category.children.any?
        category.children.each do |child|
          all_categories << child
          child.instance_variable_set(:@products_count, product_counts[child.id] || 0)
          
          if child.children.any?
            child.children.each do |grandchild|
              all_categories << grandchild
              grandchild.instance_variable_set(:@products_count, product_counts[grandchild.id] || 0)
            end
          end
        end
      end
    end
    
    render json: {
      success: true,
      data: {
        categories: categories.map { |category| CategorySerializer.new(category).serializable_hash[:data][:attributes] }
      }
    }
  end

  def show
    render json: {
      success: true,
      data: {
        category: CategorySerializer.new(@category).serializable_hash[:data][:attributes]
      }
    }
  end

  def create
    category = Category.new(category_params)
    
    if category.save
      render json: {
        success: true,
        data: {
          category: CategorySerializer.new(category).serializable_hash[:data][:attributes]
        }
      }, status: :created
    else
      render json: {
        success: false,
        error: category.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: {
        success: true,
        data: {
          category: CategorySerializer.new(@category).serializable_hash[:data][:attributes]
        }
      }
    else
      render json: {
        success: false,
        error: @category.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def destroy
    if @category.children.any?
      render json: {
        success: false,
        error: 'Cannot delete category with subcategories. Delete subcategories first.'
      }, status: :unprocessable_entity
    elsif @category.products.any?
      render json: {
        success: false,
        error: 'Cannot delete category with products. Move products first.'
      }, status: :unprocessable_entity
    else
      @category.destroy
      render json: {
        success: true,
        message: 'Category deleted successfully'
      }
    end
  end

  private

  def set_category
    @category = Category.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Category not found'
    }, status: :not_found
  end

  def category_params
    params.require(:category).permit(:name, :description, :image, :parent_id)
  end

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end
end
