# Make database connection optional for health checks
if Rails.env.production? && ENV['DATABASE_URL'].blank?
  Rails.logger.warn "DATABASE_URL not set - database features will be unavailable"
  
  # Monkey patch to prevent ActiveRecord from connecting
  module ActiveRecord
    class Base
      def self.connection
        raise "Database connection not available - DATABASE_URL not set"
      end
    end
  end
end