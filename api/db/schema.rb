# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_06_24_021736) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "banners", id: :string, force: :cascade do |t|
    t.string "title", null: false
    t.string "subtitle"
    t.text "description"
    t.string "cta_text"
    t.string "cta_url"
    t.string "background_image"
    t.string "background_color", default: "#1a5f4a"
    t.string "text_color", default: "#ffffff"
    t.integer "position", default: 0
    t.boolean "is_active", default: true, null: false
    t.datetime "start_date"
    t.datetime "end_date"
    t.string "created_by", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "page", default: "all"
    t.index ["is_active"], name: "index_banners_on_is_active"
    t.index ["page"], name: "index_banners_on_page"
    t.index ["position"], name: "index_banners_on_position"
    t.index ["start_date", "end_date"], name: "index_banners_on_start_date_and_end_date"
  end

  create_table "categories", id: :string, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.string "image"
    t.string "parent_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id"], name: "index_categories_on_parent_id"
    t.index ["slug"], name: "index_categories_on_slug", unique: true
  end

  create_table "hero_contents", force: :cascade do |t|
    t.string "title"
    t.string "subtitle"
    t.text "description"
    t.string "cta_primary_text"
    t.string "cta_primary_url"
    t.string "cta_secondary_text"
    t.string "cta_secondary_url"
    t.string "background_image"
    t.boolean "is_active"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "featured_collection_title"
    t.string "featured_collection_subtitle"
    t.string "featured_collection_image"
  end

  create_table "product_images", id: :string, force: :cascade do |t|
    t.string "product_id", null: false
    t.integer "position"
    t.string "alt_text"
    t.text "image_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id", "position"], name: "index_product_images_on_product_id_and_position", unique: true
    t.index ["product_id"], name: "index_product_images_on_product_id"
  end

  create_table "product_variants", id: :string, force: :cascade do |t|
    t.string "product_id", null: false
    t.string "option1_value"
    t.string "option2_value"
    t.string "option3_value"
    t.decimal "price", precision: 10, scale: 2, null: false
    t.integer "inventory", default: 0, null: false
    t.string "sku"
    t.decimal "weight", precision: 8, scale: 2
    t.string "dimensions"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["product_id", "option1_value", "option2_value", "option3_value"], name: "index_product_variants_on_unique_options", unique: true
    t.index ["product_id"], name: "index_product_variants_on_product_id"
    t.index ["sku"], name: "index_product_variants_on_sku", unique: true
  end

  create_table "products", id: :string, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description", null: false
    t.text "short_description"
    t.decimal "base_price", precision: 10, scale: 2, null: false
    t.decimal "compare_at_price", precision: 10, scale: 2
    t.string "sku"
    t.boolean "track_inventory", default: true, null: false
    t.integer "inventory", default: 0, null: false
    t.integer "low_stock_threshold", default: 5, null: false
    t.decimal "weight", precision: 8, scale: 2
    t.string "dimensions"
    t.json "materials"
    t.json "images"
    t.json "videos"
    t.string "meta_title"
    t.text "meta_description"
    t.integer "status", default: 0, null: false
    t.boolean "is_featured", default: false, null: false
    t.string "store_id", null: false
    t.string "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "option1_name"
    t.string "option2_name"
    t.string "option3_name"
    t.index ["category_id"], name: "index_products_on_category_id"
    t.index ["is_featured"], name: "index_products_on_is_featured"
    t.index ["slug"], name: "index_products_on_slug", unique: true
    t.index ["status"], name: "index_products_on_status"
    t.index ["store_id"], name: "index_products_on_store_id"
  end

  create_table "seller_applications", force: :cascade do |t|
    t.string "email"
    t.string "first_name"
    t.string "last_name"
    t.string "phone"
    t.string "business_name"
    t.integer "business_type"
    t.text "business_description"
    t.text "brand_story"
    t.string "years_in_business"
    t.string "website_url"
    t.text "social_media_links"
    t.text "product_categories"
    t.text "product_description"
    t.text "manufacturing_process"
    t.text "materials_sourced"
    t.string "production_location"
    t.text "sustainability_practices"
    t.text "target_audience"
    t.string "tax_id"
    t.text "business_address"
    t.text "shipping_locations"
    t.text "previous_marketplace_experience"
    t.text "references"
    t.integer "status"
    t.datetime "approved_at"
    t.datetime "rejected_at"
    t.datetime "reviewed_at"
    t.text "rejection_reason"
    t.string "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["status"], name: "index_seller_applications_on_status"
  end

  create_table "stores", id: :string, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.string "logo"
    t.string "banner"
    t.string "website"
    t.boolean "is_verified", default: false, null: false
    t.boolean "is_active", default: true, null: false
    t.decimal "commission_rate", precision: 5, scale: 4, default: "0.05", null: false
    t.string "owner_id", null: false
    t.decimal "total_sales", precision: 12, scale: 2, default: "0.0", null: false
    t.integer "total_orders", default: 0, null: false
    t.decimal "rating", precision: 3, scale: 2
    t.integer "review_count", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "review_requested_at"
    t.string "verification_status", default: "pending"
    t.string "email"
    t.string "phone"
    t.index ["owner_id"], name: "index_stores_on_owner_id", unique: true
    t.index ["slug"], name: "index_stores_on_slug", unique: true
    t.index ["verification_status"], name: "index_stores_on_verification_status"
  end

  create_table "users", id: :string, force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.integer "role", default: 0, null: false
    t.boolean "email_verified", default: false, null: false
    t.string "email_verification_token"
    t.string "password_reset_token"
    t.datetime "password_reset_expires"
    t.string "two_factor_secret"
    t.boolean "two_factor_enabled", default: false, null: false
    t.string "avatar"
    t.string "phone"
    t.date "date_of_birth"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "email_verified_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["email_verification_token"], name: "index_users_on_email_verification_token"
    t.index ["is_active"], name: "index_users_on_is_active"
    t.index ["password_reset_token"], name: "index_users_on_password_reset_token"
  end

  add_foreign_key "categories", "categories", column: "parent_id"
  add_foreign_key "product_images", "products"
  add_foreign_key "product_variants", "products"
  add_foreign_key "products", "categories"
  add_foreign_key "products", "stores"
  add_foreign_key "stores", "users", column: "owner_id"
end
