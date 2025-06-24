class Api::V1::AddressesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_address, only: [:show, :update, :destroy, :set_default]
  
  # GET /api/v1/addresses
  def index
    addresses = current_user.addresses.order(:is_default => :desc, :created_at => :desc)
    render json: AddressSerializer.new(addresses).serializable_hash
  end
  
  # GET /api/v1/addresses/:id
  def show
    render json: AddressSerializer.new(@address).serializable_hash
  end
  
  # POST /api/v1/addresses
  def create
    address = current_user.addresses.build(address_params)
    
    # If this is the first address, make it default
    if current_user.addresses.count == 0
      address.is_default = true
    end
    
    if address.save
      render json: AddressSerializer.new(address).serializable_hash, status: :created
    else
      render json: { 
        errors: address.errors.full_messages,
        details: address.errors.messages
      }, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /api/v1/addresses/:id
  def update
    if @address.update(address_params)
      render json: AddressSerializer.new(@address).serializable_hash
    else
      render json: { 
        errors: @address.errors.full_messages,
        details: @address.errors.messages
      }, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/addresses/:id
  def destroy
    was_default = @address.is_default?
    @address.destroy
    
    # If we deleted the default address, make another one default
    if was_default && current_user.addresses.any?
      current_user.addresses.first.update(is_default: true)
    end
    
    head :no_content
  end
  
  # POST /api/v1/addresses/:id/set_default
  def set_default
    # Remove default from all other addresses
    current_user.addresses.update_all(is_default: false)
    
    # Set this address as default
    @address.update(is_default: true)
    
    render json: AddressSerializer.new(@address).serializable_hash
  end
  
  private
  
  def set_address
    @address = current_user.addresses.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Address not found' }, status: :not_found
  end
  
  def address_params
    params.require(:address).permit(
      :full_name, :address_line_1, :address_line_2,
      :city, :state, :zip_code, :country, :phone, :is_default
    )
  end
end