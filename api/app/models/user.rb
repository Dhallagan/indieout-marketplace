class User < ApplicationRecord
  has_secure_password

  # Enums
  enum role: { consumer: 0, seller_admin: 1, system_admin: 2 }

  # Associations
  has_one :store, foreign_key: :owner_id, dependent: :destroy
  has_one :cart, dependent: :destroy
  has_many :orders, dependent: :destroy
  has_many :addresses, dependent: :destroy
  has_many :reviews, dependent: :destroy
  has_many :wishlist_items, dependent: :destroy

  # Validations
  validates :email, presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, :last_name, presence: true, length: { minimum: 2, maximum: 50 }
  validates :password, length: { minimum: 8 }, if: -> { new_record? || !password.nil? }

  # Callbacks
  before_save { self.email = email.downcase }
  before_create :generate_verification_token
  before_create :set_cuid_id

  # Instance methods
  def full_name
    "#{first_name} #{last_name}"
  end

  def is_active?
    is_active
  end

  def generate_password_reset_token
    self.password_reset_token = SecureRandom.urlsafe_base64
    self.password_reset_expires = 1.hour.from_now
    save!
  end

  def clear_password_reset_token
    self.password_reset_token = nil
    self.password_reset_expires = nil
    save!
  end

  def password_reset_expired?
    password_reset_expires && password_reset_expires < Time.current
  end

  def verify_email!
    self.email_verified = true
    self.email_verification_token = nil
    save!
  end

  def current_cart
    cart || create_cart(expires_at: 30.days.from_now)
  end

  private

  def generate_verification_token
    self.email_verification_token = SecureRandom.urlsafe_base64
  end

  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end
