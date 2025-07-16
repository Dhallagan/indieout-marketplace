class StoreSerializer
  include JSONAPI::Serializer

  attributes :id, :name, :slug, :description, :website,
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
  
  attribute :logo do |store|
    if store.logo.present?
      {
        thumb: store.logo_url(size: :thumb),
        medium: store.logo_url(size: :medium),
        large: store.logo_url(size: :large),
        original: store.logo_url(size: :original)
      }
    end
  end
  
  attribute :banner do |store|
    if store.banner.present?
      {
        thumb: store.banner_url(size: :thumb),
        medium: store.banner_url(size: :medium),
        large: store.banner_url(size: :large),
        hero: store.banner_url(size: :hero),
        hero_mobile: store.banner_url(size: :hero_mobile),
        original: store.banner_url(size: :original)
      }
    end
  end
end