import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, Home, ShoppingBag, Package, User, Heart, Store, Settings, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const MobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, vendorRequestStatus, fetchVendorRequestStatus } = useAuthStore()

  useEffect(() => {
    const fetchStatus = async () => {
      if (isAuthenticated && user?.role !== 'vendor') {
        await fetchVendorRequestStatus()
      }
    }

    fetchStatus()
  }, [isAuthenticated, user, fetchVendorRequestStatus])

  const menuItems = [
    {
      name: 'Home',
      href: '/',
      icon: Home
    },
    {
      name: 'Products',
      href: '/products',
      icon: ShoppingBag
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: Package
    }
  ]

  const accountItems = [
    {
      name: 'My Profile',
      href: '/profile',
      icon: User
    },
    {
      name: 'My Orders',
      href: '/orders',
      icon: Package
    },
    {
      name: 'Wishlist',
      href: '/wishlist',
      icon: Heart
    }
  ]

  // Add vendor menu item dynamically based on status
  const getVendorMenuItem = () => {
    if (user?.role === 'vendor') {
      return {
        name: 'Vendor Panel',
        href: '/vendor/dashboard',
        icon: Store
      }
    }
    
    if (vendorRequestStatus?.hasRequest) {
      if (vendorRequestStatus.request.status === 'pending') {
        return {
          name: 'Application Pending',
          href: '/become-vendor',
          icon: Store
        }
      } else if (vendorRequestStatus.request.status === 'rejected') {
        return {
          name: 'Become a Vendor',
          href: '/become-vendor',
          icon: Store
        }
      }
    }
    
    return {
      name: 'Become a Vendor',
      href: '/become-vendor',
      icon: Store
    }
  }

  const allAccountItems = [...accountItems, getVendorMenuItem(), {
    name: 'Settings',
    href: '/settings',
    icon: Settings
  }]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* User Info Section - Only show when authenticated */}
            {isAuthenticated && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Menu */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Menu</h3>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={onClose}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  )
                })}
              </nav>
            </div>

            {/* Account Section */}
            {isAuthenticated && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Account</h3>
                <nav className="space-y-1">
                  {allAccountItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                        onClick={onClose}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )
                  })}
                </nav>
              </div>
            )}

            {/* Auth Section */}
            <div className="p-4 border-t border-gray-200">
              {isAuthenticated ? (
                <button
                  onClick={async () => {
                    await logout()
                    onClose()
                    navigate('/')
                  }}
                  className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-center"
                >
                  Logout
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-center"
                    onClick={onClose}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-center"
                    onClick={onClose}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
