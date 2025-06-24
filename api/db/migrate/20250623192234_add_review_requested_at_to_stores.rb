class AddReviewRequestedAtToStores < ActiveRecord::Migration[7.1]
  def change
    add_column :stores, :review_requested_at, :datetime
  end
end
