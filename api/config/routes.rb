Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
  get "/health", to: proc { [200, {}, ['OK']] }

  # API routes
  namespace :api do
    namespace :v1 do
      # Authentication routes
      scope :auth do
        post :register, to: 'auth#register'
        post :login, to: 'auth#login'
        get :me, to: 'auth#me'
        post :verify_email, to: 'auth#verify_email'
        post :forgot_password, to: 'auth#forgot_password'
        post :reset_password, to: 'auth#reset_password'
        post :become_seller, to: 'auth#become_seller'
      end

      # Profile management
      get 'profile', to: 'profiles#show'
      patch 'profile', to: 'profiles#update'

      # Public routes (no authentication required)
      namespace :public do
        resources :stores, only: [:index, :show]
        resources :banners, only: [:index]
      end

      # Category management (admin only for CUD, public for read)
      resources :categories, except: [:new, :edit]

      # Store management (seller admin only)
      resources :stores, except: [:new, :edit] do
        member do
          post :submit_for_review
        end
      end

      # Seller applications (public create, admin manage)
      resources :seller_applications, except: [:new, :edit, :update, :destroy] do
        member do
          post :approve
          post :reject
        end
      end

      # Product management (seller only for CUD, public for read)
      resources :products, except: [:new, :edit] do
        collection do
          get :my_products
        end
        resources :product_images, only: [:index, :show, :create, :update, :destroy], path: 'images' do
          collection do
            patch :reorder
          end
          member do
            patch :set_primary
          end
        end
      end

      # Banner management (admin only)
      resources :banners, except: [:new, :edit]

      # Hero content management (admin only)
      get 'hero-content', to: 'hero_content#show'
      put 'hero-content', to: 'hero_content#update'

      # Public hero content
      get 'hero-content/current', to: 'hero_content#current'

      # Admin routes (system admin only)
      namespace :admin do
        # Dashboard stats
        get 'dashboard/stats', to: 'dashboard#stats'
        
        # Seller management
        resources :sellers, only: [:index] do
          member do
            patch :approve
            patch :reject
            patch :toggle_status
          end
        end
        
        # User management
        resources :users, only: [:index] do
          member do
            patch :toggle_status
            patch :role
          end
        end
        
        # Product management
        resources :products, only: [:index] do
          member do
            patch :toggle_featured
            patch :status
          end
        end
      end

      # Cart management (authenticated users)
      get 'cart', to: 'carts#show'
      post 'cart/items', to: 'carts#add_item'
      put 'cart/items/:id', to: 'carts#update_item'
      delete 'cart/items/:id', to: 'carts#remove_item'
      delete 'cart', to: 'carts#clear'

      # Order management (authenticated users)
      resources :orders, only: [:index, :show, :create] do
        member do
          patch :cancel
          patch :fulfill  # for store owners
          patch :update_status  # for store owners
        end
      end

      # Address management (authenticated users)
      resources :addresses do
        member do
          post :set_default
        end
      end

      # Guest checkout (no authentication required)
      namespace :guest do
        post 'orders', to: 'guest_orders#create'
        get 'orders/:order_number', to: 'guest_orders#show'
      end

      # File uploads (seller only)
      resources :uploads, only: [:create]
      delete 'uploads/:filename', to: 'uploads#destroy'
      post 'uploads/product/:product_id', to: 'uploads#create_for_product'

      # Health check for API
      get :health, to: proc { [200, {}, [{ status: 'OK', timestamp: Time.current.iso8601 }.to_json]] }
    end
    
    # Catch all route for undefined API endpoints
    match '*path', to: 'application#not_found', via: :all
  end
  
  # Catch all route for non-API routes (let React handle them)
  get '*path', to: 'application#fallback_index_html', constraints: ->(request) do
    !request.xhr? && request.format.html?
  end
end
