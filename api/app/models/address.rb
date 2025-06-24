class Address < ApplicationRecord
  belongs_to :user
  
  validates :full_name, presence: true, length: { maximum: 100 }
  validates :address_line_1, presence: true, length: { maximum: 100 }
  validates :address_line_2, length: { maximum: 100 }
  validates :city, presence: true, length: { maximum: 50 }
  validates :state, presence: true, length: { maximum: 50 }
  validates :zip_code, presence: true, length: { maximum: 10 }
  validates :country, presence: true, length: { maximum: 2 }
  validates :phone, length: { maximum: 20 }
  
  # Ensure only one default address per user
  validates :is_default, uniqueness: { scope: :user_id }, if: :is_default?
  
  before_save :ensure_single_default
  before_create :set_cuid_id
  
  scope :default_address, -> { where(is_default: true) }
  scope :for_user, ->(user_id) { where(user_id: user_id) }
  
  def formatted_address
    lines = [address_line_1]
    lines << address_line_2 if address_line_2.present?
    lines << "#{city}, #{state} #{zip_code}"
    lines << country if country != 'US'
    lines.join(', ')
  end
  
  def to_shipping_address
    {
      full_name: full_name,
      address_line_1: address_line_1,
      address_line_2: address_line_2,
      city: city,
      state: state,
      zip_code: zip_code,
      country: country,
      phone: phone
    }
  end
  
  private
  
  def ensure_single_default
    if is_default? && is_default_changed?
      # Remove default from other addresses for this user
      user.addresses.where.not(id: id).update_all(is_default: false)
    end
  end
  
  def set_cuid_id
    self.id = SecureRandom.urlsafe_base64(12) if id.blank?
  end
end
