import { Outlet, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import Header from '../components/Header'
import Footer from '../components/Footer'
import CartSidebar from '../components/cart/CartSidebar'
import AdminSidebar from '../components/admin/AdminSidebar'
import VendorSidebar from '../components/vendor/VendorSidebar'
import { useCartStore } from '../store/cartStore'
import { useEffect } from 'react'

const Layout = ({ requiredRole }) => {
  const { user, isAuthenticated } = useAuthStore()
  const { isOpen, closeCart } = useCartStore()

  // Check role-based access
  if (requiredRole && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  // Close cart when navigating
  useEffect(() => {
    closeCart()
  }, [closeCart])

  // Render different layouts based on role
  const renderSidebar = () => {
    if (user?.role === 'admin') {
      return <AdminSidebar />
    }
    if (user?.role === 'vendor') {
      return <VendorSidebar />
    }
    return null
  }

  const renderContent = () => {
    if (user?.role === 'admin' || user?.role === 'vendor') {
      return (
        <div className="flex">
          {renderSidebar()}
          <main className="flex-1 min-h-screen bg-gray-50">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      )
    }

    return (
      <>
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {renderContent()}
      
      {/* Cart Sidebar - only show for regular users */}
      {user?.role === 'user' && (
        <CartSidebar isOpen={isOpen} onClose={closeCart} />
      )}
    </div>
  )
}

export default Layout
