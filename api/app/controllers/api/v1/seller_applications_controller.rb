class Api::V1::SellerApplicationsController < ApplicationController
  before_action :authenticate_user!, only: [:index, :show, :approve, :reject]
  before_action :ensure_admin!, only: [:index, :show, :approve, :reject]
  before_action :set_application, only: [:show, :approve, :reject]

  def index
    applications = SellerApplication.all.order(created_at: :desc)
    
    # Filter by status if provided
    if params[:status].present? && SellerApplication.statuses.key?(params[:status])
      applications = applications.where(status: params[:status])
    end
    
    render json: {
      success: true,
      data: {
        applications: applications.map { |app| serialize_application(app) }
      }
    }
  end

  def show
    render json: {
      success: true,
      data: {
        application: serialize_application(@application)
      }
    }
  end

  def create
    # Check if email already has an application
    existing_application = SellerApplication.find_by(email: params[:email]&.downcase)
    if existing_application
      render json: {
        success: false,
        error: 'An application with this email already exists'
      }, status: :unprocessable_entity
      return
    end

    # Check if email is already a user
    existing_user = User.find_by(email: params[:email]&.downcase)
    if existing_user
      render json: {
        success: false,
        error: 'An account with this email already exists'
      }, status: :unprocessable_entity
      return
    end

    application = SellerApplication.new(application_params)
    
    if application.save
      # Auto-approve and create seller account + store
      begin
        user = application.approve!
        
        render json: {
          success: true,
          data: {
            application: serialize_application(application),
            user: {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              role: user.role
            }
          },
          message: 'Application approved! Your seller account has been created. Please check your email for login instructions.'
        }, status: :created
      rescue => e
        # If auto-approval fails, still save the application but don't auto-approve
        render json: {
          success: true,
          data: {
            application: serialize_application(application)
          },
          message: 'Application submitted successfully. We will review your application within 3-5 business days.'
        }, status: :created
      end
    else
      render json: {
        success: false,
        error: application.errors.full_messages.first
      }, status: :unprocessable_entity
    end
  end

  def approve
    begin
      user = @application.approve!
      
      render json: {
        success: true,
        data: {
          application: serialize_application(@application)
        },
        message: 'Application approved successfully. User account and store created.'
      }
    rescue => e
      render json: {
        success: false,
        error: "Failed to approve application: #{e.message}"
      }, status: :unprocessable_entity
    end
  end

  def reject
    reason = params[:reason]
    @application.reject!(reason)
    
    render json: {
      success: true,
      data: {
        application: serialize_application(@application)
      },
      message: 'Application rejected successfully.'
    }
  end

  private

  def set_application
    @application = SellerApplication.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: {
      success: false,
      error: 'Application not found'
    }, status: :not_found
  end

  def application_params
    params.permit(
      :email, :first_name, :last_name, :phone,
      :business_name, :business_type, :business_description, :brand_story,
      :years_in_business, :website_url, :social_media_links,
      :product_categories, :product_description, :manufacturing_process,
      :materials_sourced, :production_location, :sustainability_practices,
      :target_audience, :tax_id, :business_address, :shipping_locations,
      :previous_marketplace_experience, :references
    )
  end

  def ensure_admin!
    unless current_user&.system_admin?
      render json: {
        success: false,
        error: 'Admin access required'
      }, status: :forbidden
    end
  end

  def serialize_application(application)
    {
      id: application.id,
      email: application.email,
      first_name: application.first_name,
      last_name: application.last_name,
      full_name: application.full_name,
      phone: application.phone,
      business_name: application.business_name,
      business_type: application.business_type,
      business_description: application.business_description,
      brand_story: application.brand_story,
      years_in_business: application.years_in_business,
      website_url: application.website_url,
      social_media_links: application.social_media_links,
      product_categories: application.product_categories,
      product_description: application.product_description,
      manufacturing_process: application.manufacturing_process,
      materials_sourced: application.materials_sourced,
      production_location: application.production_location,
      sustainability_practices: application.sustainability_practices,
      target_audience: application.target_audience,
      tax_id: application.tax_id,
      business_address: application.business_address,
      shipping_locations: application.shipping_locations,
      previous_marketplace_experience: application.previous_marketplace_experience,
      references: application.references,
      status: application.status,
      approved_at: application.approved_at,
      rejected_at: application.rejected_at,
      reviewed_at: application.reviewed_at,
      rejection_reason: application.rejection_reason,
      user_id: application.user_id,
      created_at: application.created_at,
      updated_at: application.updated_at
    }
  end
end