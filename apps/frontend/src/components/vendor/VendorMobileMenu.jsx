import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { X, LayoutDashboard, Package, ShoppingBag, Star, DollarSign, Settings, Store, TrendingUp, Users, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const VendorMobileMenu = ({ isOpen, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/vendor/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Products',
      href: '/vendor/products',
      icon: Package
    },
    {
      name: 'Orders',
      href: '/vendor/orders',
      icon: ShoppingBag
    },
    {
      name: 'Earnings',
      href: '/vendor/earnings',
      icon: DollarSign
    },
    {
      name: 'Reviews',
      href: '/vendor/reviews',
      icon: Star
    },
    {
      name: 'Analytics',
      href: '/vendor/analytics',
      icon: TrendingUp
    },
    {
      name: 'Customers',
      href: '/vendor/customers',
      icon: Users
    },
    {
      name: 'Settings',
      href: '/vendor/settings',
      icon: Settings
    }
  ]

  const handleLogout = async () => {
    await logout()
    onClose()
    navigate('/')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-900 text-white">
            <div className="flex items-center space-x-3">
              <Store className="w-6 h-6 text-primary-400" />
              <h2 className="text-lg font-semibold">Vendor Menu</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Main Menu */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Navigation</h3>
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
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Account</h3>
              <nav className="space-y-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorMobileMenu
