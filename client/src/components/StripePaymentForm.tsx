import { useState } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import type { StripeError } from '@stripe/stripe-js'

interface StripePaymentFormProps {
  onSuccess: () => void
  onError: (error: string) => void
  disabled?: boolean
}

export default function StripePaymentForm({ 
  onSuccess, 
  onError,
  disabled = false
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Confirm the payment
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: {
          // Return URL for redirect-based payment methods
          return_url: `${window.location.origin}/order-confirmation`,
        },
      })

      if (error) {
        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        const message = error.message || 'An unexpected error occurred.'
        setErrorMessage(message)
        onError(message)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded
        onSuccess()
      } else {
        // Payment requires additional actions
        setErrorMessage('Payment processing requires additional steps.')
        onError('Payment processing requires additional steps.')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setErrorMessage(message)
      onError(message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-sand-200 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Payment Details</h3>
        
        <PaymentElement 
          options={{
            layout: 'tabs',
            defaultValues: {
              billingDetails: {
                email: '',
                phone: '',
                address: {
                  country: 'US',
                }
              }
            }
          }}
          className="mb-6"
        />

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || disabled || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          !stripe || disabled || isProcessing
            ? 'bg-charcoal-300 text-charcoal-500 cursor-not-allowed'
            : 'bg-forest-600 text-white hover:bg-forest-700 shadow-lg hover:shadow-xl'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Complete Payment'
        )}
      </button>

      <div className="text-center text-sm text-charcoal-500">
        <svg className="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your payment information is encrypted and secure
      </div>
    </form>
  )
}