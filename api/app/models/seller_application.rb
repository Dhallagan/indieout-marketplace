class SellerApplication < ApplicationRecord
  enum status: {
    pending: 0,
    approved: 1,
    rejected: 2,
    under_review: 3
  }

  enum business_type: {
    sole_proprietorship: 0,
    llc: 1,
    corporation: 2,
    partnership: 3
  }

  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, :last_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :phone, presence: true
  validates :business_name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :business_description, presence: true, length: { minimum: 50, maximum: 1000 }
  validates :brand_story, presence: true, length: { minimum: 50, maximum: 1000 }
  validates :product_description, presence: true, length: { minimum: 50, maximum: 1000 }
  validates :manufacturing_process, presence: true, length: { minimum: 20, maximum: 500 }
  validates :production_location, presence: true, length: { minimum: 5, maximum: 100 }
  validates :business_type, presence: true

  scope :pending_review, -> { where(status: [:pending, :under_review]) }
  scope :approved, -> { where(status: :approved) }
  scope :rejected, -> { where(status: :rejected) }

  before_save { self.email = email.downcase }

  def approve!
    transaction do
      # Create user account
      user = User.create!(
        email: email,
        password: SecureRandom.urlsafe_base64(16), # Temporary password
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        role: :seller_admin,
        email_verified: true
      )
      
      # Create store for the user
      store = user.create_store!(
        name: business_name,
        description: business_description,
        website: website_url,
        is_verified: true,
        is_active: false # Will be activated when they submit for review
      )
      
      # Update application
      update!(
        status: :approved, 
        approved_at: Time.current,
        user_id: user.id
      )
      
      # TODO: Send approval email with login instructions
      Rails.logger.info "Seller application approved for #{email}"
      
      user
    end
  end

  def reject!(reason = nil)
    update!(
      status: :rejected, 
      rejected_at: Time.current,
      rejection_reason: reason
    )
    
    # TODO: Send rejection email
    Rails.logger.info "Seller application rejected for #{email}: #{reason}"
  end

  def under_review!
    update!(status: :under_review, reviewed_at: Time.current)
  end

  def full_name
    "#{first_name} #{last_name}"
  end
end