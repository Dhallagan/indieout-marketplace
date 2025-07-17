require 'stripe'

# Configure Stripe
Stripe.api_key = ENV['STRIPE_SECRET_KEY']

# Set Stripe API version for consistency
Stripe.api_version = '2023-10-16'

# Configure Stripe logging in development
if Rails.env.development?
  Stripe.log_level = Stripe::LEVEL_INFO
end

# Validate Stripe configuration
Rails.application.config.after_initialize do
  if ENV['STRIPE_SECRET_KEY'].blank?
    Rails.logger.warn "Stripe API key not configured. Payment processing will not work."
  else
    Rails.logger.info "Stripe configured successfully"
  end
end