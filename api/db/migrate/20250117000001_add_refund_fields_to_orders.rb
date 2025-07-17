class AddRefundFieldsToOrders < ActiveRecord::Migration[7.1]
  def change
    add_column :orders, :refunded_at, :datetime
    add_column :orders, :refund_amount, :decimal, precision: 10, scale: 2
    add_column :orders, :refund_reason, :text
  end
end