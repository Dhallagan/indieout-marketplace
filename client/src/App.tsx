import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import DashboardPage from '@/pages/DashboardPage'
import CategoryManagementPage from '@/pages/CategoryManagementPage'
import BannerManagementPage from '@/pages/admin/BannerManagementPage'
import HeroManagementPage from '@/pages/admin/HeroManagementPage'
import SellersManagementPage from '@/pages/admin/SellersManagementPage'
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import UsersManagementPage from '@/pages/admin/UsersManagementPage'
import ProductsOversightPage from '@/pages/admin/ProductsOversightPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import StoreSetupPage from '@/pages/StoreSetupPage'
import SellerApplicationPage from '@/pages/SellerApplicationPage'
import ProductManagementPage from '@/pages/ProductManagementPage'
import ProductCreatePage from '@/pages/ProductCreatePage'
import ProductEditPage from '@/pages/ProductEditPage'
import SellerSettingsPage from '@/pages/SellerSettingsPage'
import SellerOrdersPage from '@/pages/seller/SellerOrdersPage'
import SellerDashboardPage from '@/pages/seller/SellerDashboardPage'
import SellerProductsPage from '@/pages/seller/SellerProductsPage'
import ShopPage from '@/pages/ShopPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import StoreDetailPage from '@/pages/StoreDetailPage'
import CartPage from '@/pages/CartPage'
import CheckoutPageWithStripe from '@/pages/CheckoutPageWithStripe'
import CheckoutSuccessPage from '@/pages/CheckoutSuccessPage'
import OrderConfirmationPage from '@/pages/OrderConfirmationPage'
import GuestOrderTrackingPage from '@/pages/GuestOrderTrackingPage'
import SearchResultsPage from '@/pages/SearchResultsPage'
import BrandsPage from '@/pages/BrandsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import ProtectedRoute from '@/components/ProtectedRoute'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Admin Routes - No main layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute>
            <CategoryManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/banners"
        element={
          <ProtectedRoute>
            <BannerManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hero"
        element={
          <ProtectedRoute>
            <HeroManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <ProtectedRoute>
            <SellersManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UsersManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <ProductsOversightPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <AdminOrdersPage />
          </ProtectedRoute>
        }
      />
      {/* Seller Routes - Use SellerLayout */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute>
            <SellerDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store/setup"
        element={
          <ProtectedRoute>
            <StoreSetupPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products"
        element={
          <ProtectedRoute>
            <SellerProductsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/new"
        element={
          <ProtectedRoute>
            <ProductCreatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/products/:id/edit"
        element={
          <ProtectedRoute>
            <ProductEditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <ProtectedRoute>
            <SellerSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <ProtectedRoute>
            <SellerOrdersPage />
          </ProtectedRoute>
        }
      />

      {/* Public Routes - With main layout */}
      <Route path="/*" element={
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/apply-to-sell" element={<SellerApplicationPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/brands" element={<BrandsPage />} />
            <Route path="/shop/products/:slug" element={<ProductDetailPage />} />
            <Route path="/shop/stores/:slug" element={<StoreDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPageWithStripe />} />
            <Route path="/checkout/success/:orderId" element={<CheckoutSuccessPage />} />
            <Route path="/order-confirmation/:orderId" element={<OrderConfirmationPage />} />
            <Route path="/track-order" element={<GuestOrderTrackingPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Layout>
      } />
    </Routes>
  )
}

export default App