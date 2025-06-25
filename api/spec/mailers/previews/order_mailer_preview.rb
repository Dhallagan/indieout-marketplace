# Preview all emails at http://localhost:3000/rails/mailers/order_mailer_mailer
class OrderMailerPreview < ActionMailer::Preview

  # Preview this email at http://localhost:3000/rails/mailers/order_mailer_mailer/order_confirmation
  def order_confirmation
    OrderMailer.order_confirmation
  end

  # Preview this email at http://localhost:3000/rails/mailers/order_mailer_mailer/order_status_update
  def order_status_update
    OrderMailer.order_status_update
  end

  # Preview this email at http://localhost:3000/rails/mailers/order_mailer_mailer/shipping_confirmation
  def shipping_confirmation
    OrderMailer.shipping_confirmation
  end

end
