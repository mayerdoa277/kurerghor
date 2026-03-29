import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import Layout from './layouts/Layout'
import PublicLayout from './layouts/PublicLayout'
import DemoModeToggle from './demo/components/DemoModeToggle.jsx'

// Pages
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import ResetPassword from './pages/ResetPassword'
import VerifyOTP from './pages/VerifyOTP'
import Login from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ProfilePage from './pages/ProfilePage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import WishlistPage from './pages/WishlistPage'
import SearchPage from './pages/SearchPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import ContactPage from './pages/ContactPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import BecomeVendorPage from './pages/BecomeVendorPage'
import NotFoundPage from './pages/NotFoundPage'
import VendorSettingsPage from './pages/VendorSettingsPage'
import SettingsPage from './pages/SettingsPage'

// Auth protected pages
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorProducts from './pages/vendor/VendorProducts'
import VendorOrders from './pages/vendor/VendorOrders'
import VendorEarnings from './pages/vendor/VendorEarnings'
import VendorProfile from './pages/vendor/VendorProfile'
import VendorProductAdd from './pages/vendor/VendorProductAdd'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserDetail from './pages/admin/AdminUserDetail'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductAdd from './pages/admin/AdminProductAdd'
import AdminOrders from './pages/admin/AdminOrders'
import AdminVendors from './pages/admin/AdminVendors'
import AdminCategories from './pages/admin/AdminCategories'
import AdminCategoryNew from './pages/admin/AdminCategoryNew'
import AdminCategoryEdit from './pages/admin/AdminCategoryEdit'
import AdminCoupons from './pages/admin/AdminCoupons'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminSettings from './pages/admin/AdminSettings'

function App() {
  const { initializeAuth, isAuthenticated } = useAuthStore()
  const { initializeCart } = useCartStore()

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth()
    
    // Initialize cart from localStorage
    initializeCart(isAuthenticated)
  }, [initializeAuth, initializeCart, isAuthenticated])

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faq" element={<FAQPage />} />
        </Route>

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Protected user routes */}
        <Route path="/" element={<Layout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="settings/vendor" element={<VendorSettingsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="become-vendor" element={<BecomeVendorPage />} />
        </Route>

        {/* Vendor routes */}
        <Route path="/vendor" element={<Layout requiredRole="vendor" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="products" element={<VendorProducts />} />
          <Route path="products/add" element={<VendorProductAdd />} />
          <Route path="orders" element={<VendorOrders />} />
          <Route path="earnings" element={<VendorEarnings />} />
          <Route path="profile" element={<VendorProfile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<Layout requiredRole="admin" />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetail />} />
          <Route path="vendors" element={<AdminVendors />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminProductAdd />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<AdminCategoryNew />} />
          <Route path="categories/:id/edit" element={<AdminCategoryEdit />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Demo Mode Toggle - Always visible */}
      <DemoModeToggle />
    </div>
  )
}

export default App
