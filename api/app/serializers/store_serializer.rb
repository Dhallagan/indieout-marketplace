class StoreSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :slug, :description, :logo, :banner, :website,
             :is_verified, :is_active, :commission_rate, :total_sales,
             :total_orders, :rating, :review_count, :created_at, :updated_at,
             :verification_status, :email, :phone

  attribute :owner do |store|
    {
      id: store.owner.id,
      first_name: store.owner.first_name,
      last_name: store.owner.last_name,
      email: store.owner.email
    }
  end

  attribute :display_rating do |store|
    store.display_rating
  end

  attribute :active do |store|
    store.active?
  end

  attribute :verified do |store|
    store.verified?
  end
end