# Stripe Payment Integration Setup

This guide explains how to complete the Stripe integration for the Outdoor Marketplace.

## Prerequisites

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard

## Configuration Steps

### 1. Backend Configuration (Rails API)

Add these environment variables to `/api/.env`:

```bash
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Frontend Configuration (React)

Add this environment variable to `/client/.env`:

```bash
# Replace with your actual publishable key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### 3. Webhook Configuration

1. In your Stripe Dashboard, go to Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/v1/stripe/webhook`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the webhook signing secret and add it to `STRIPE_WEBHOOK_SECRET`

### 4. Test Card Numbers

For testing, use these Stripe test card numbers:

- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

Use any future expiry date and any 3-digit CVC.

## Current Implementation

The following components are already implemented:

### Backend
- ✅ Stripe configuration (`/api/config/initializers/stripe.rb`)
- ✅ StripePaymentService (`/api/app/services/stripe_payment_service.rb`)
- ✅ Payment controller with intent creation and webhook handling
- ✅ Order model with payment status tracking
- ✅ Database migration for `stripe_customer_id` on users

### Frontend
- ✅ Stripe.js integration
- ✅ StripeProvider component for Elements context
- ✅ StripePaymentForm component with payment collection
- ✅ CheckoutPageWithStripe for two-step checkout flow
- ✅ Order confirmation page

## Payment Flow

1. User adds items to cart
2. User proceeds to checkout
3. User enters shipping information
4. System creates order and payment intent
5. User enters payment details via Stripe Elements
6. Stripe processes payment
7. Webhook confirms payment status
8. User sees order confirmation

## Testing the Integration

1. Start both Rails and React servers:
   ```bash
   npm run dev
   ```

2. Create a test account and add items to cart

3. Proceed through checkout with test card

4. For webhook testing locally, use Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:5000/api/v1/stripe/webhook
   ```

## Next Steps

1. Implement email notifications (order confirmation, payment failed)
2. Add support for saved payment methods
3. Implement refund management UI
4. Add payment history for users
5. Create seller payout system

## Security Notes

- Never commit real API keys to version control
- Always verify webhook signatures
- Use HTTPS in production
- Keep Stripe libraries updated
- Follow PCI compliance guidelines