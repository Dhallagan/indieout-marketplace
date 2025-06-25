require "rails_helper"

RSpec.describe OrderMailer, type: :mailer do
  # Create test data with minimal setup
  let(:user) do 
    User.new(
      id: 1,
      email: "test@example.com",
      first_name: "Test",
      last_name: "User"
    )
  end
  
  let(:order) do
    Order.new(
      id: 1,
      user: user,
      order_number: "ORD-12345",
      status: "pending",
      created_at: Time.current,
      updated_at: Time.current,
      total_amount: 99.99,
      shipping_address: { 
        street: "123 Main St",
        city: "Test City",
        state: "TS",
        zip: "12345"
      }.to_json,
      order_items: []
    )
  end
  
  describe "order_confirmation" do
    let(:mail) { OrderMailer.order_confirmation(order) }

    it "renders the headers" do
      expect(mail.subject).to eq("Order Confirmation - ORD-12345")
      expect(mail.to).to eq(["test@example.com"])
      expect(mail.from).to eq(["noreply@indieout.com"])
    end

    it "renders the body" do
      # Just check that the mail body is generated without error
      expect(mail.body.encoded).to be_present
    end
  end

  describe "order_status_update" do
    let(:mail) { OrderMailer.order_status_update(order, "pending") }

    it "renders the headers" do
      expect(mail.subject).to eq("Order Update - ORD-12345")
      expect(mail.to).to eq(["test@example.com"])
      expect(mail.from).to eq(["noreply@indieout.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to be_present
    end
  end

  describe "shipping_confirmation" do
    let(:mail) { OrderMailer.shipping_confirmation(order, "TRACK123") }

    it "renders the headers" do
      expect(mail.subject).to eq("Your order has shipped - ORD-12345")
      expect(mail.to).to eq(["test@example.com"])
      expect(mail.from).to eq(["noreply@indieout.com"])
    end

    it "renders the body" do
      expect(mail.body.encoded).to be_present
    end
  end
end