import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function CheckoutSuccessPage() {
  const location = useLocation()
  const { orderTotal, orderNumber } = location.state || {}

  useEffect(() => {
    // Clear any stored cart data since order is complete
    // This is already handled by the checkout process, but good to be safe
  }, [])

  return (
    <div className="min-h-screen bg-sand-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-card p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-forest-100 mb-6">
            <svg className="h-8 w-8 text-forest-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-charcoal-900 mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-lg text-charcoal-600 mb-8">
            Thank you for your purchase. Your order has been successfully placed and you'll receive a confirmation email shortly.
          </p>

          {/* Order Details */}
          {orderNumber && (
            <div className="bg-sand-50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm font-medium text-charcoal-700 mb-1">Order Number</p>
                  <p className="text-lg font-semibold text-charcoal-900">{orderNumber}</p>
                </div>
                
                {orderTotal && (
                  <div>
                    <p className="text-sm font-medium text-charcoal-700 mb-1">Total Amount</p>
                    <p className="text-lg font-semibold text-charcoal-900">${orderTotal.toFixed(2)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white border border-sand-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-4">What's Next?</h3>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-forest-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Order Confirmation</p>
                  <p className="text-sm text-charcoal-600">You'll receive an email confirmation with your order details within the next few minutes.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-forest-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Processing & Shipping</p>
                  <p className="text-sm text-charcoal-600">Your items will be carefully packaged by our sellers and shipped within 2-3 business days.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-forest-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-sm font-bold text-forest-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Tracking Information</p>
                  <p className="text-sm text-charcoal-600">Once shipped, you'll receive tracking information to monitor your delivery.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-forest-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-forest-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Continue Shopping</span>
            </Link>
            
            <Link
              to="/dashboard"
              className="border-2 border-forest-600 text-forest-600 px-8 py-3 rounded-lg font-semibold hover:bg-forest-50 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>View Orders</span>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-sand-200">
            <h4 className="font-semibold text-charcoal-900 mb-4">Need Help?</h4>
            <p className="text-sm text-charcoal-600 mb-4">
              If you have any questions about your order, don't hesitate to reach out to our support team.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:support@indieout.com"
                className="text-forest-600 hover:text-forest-700 font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@indieout.com</span>
              </a>
              
              <a
                href="tel:+1-555-0123"
                className="text-forest-600 hover:text-forest-700 font-medium flex items-center justify-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>1-555-0123</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}