class UserSerializer
  include JSONAPI::Serializer

  attributes :id, :email, :first_name, :last_name, :role, :email_verified, 
             :avatar, :phone, :created_at, :updated_at, :is_active, :email_verified_at

  attribute :store do |user|
    if user.store
      {
        id: user.store.id,
        name: user.store.name,
        slug: user.store.slug,
        is_verified: user.store.is_verified,
        is_active: user.store.is_active
      }
    end
  end

  # Don't include sensitive fields
  attribute :password_digest, if: proc { false }
  attribute :email_verification_token, if: proc { false }
  attribute :password_reset_token, if: proc { false }
  attribute :two_factor_secret, if: proc { false }
end