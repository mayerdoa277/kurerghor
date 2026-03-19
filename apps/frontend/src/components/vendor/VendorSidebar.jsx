import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Star, 
  DollarSign, 
  Settings, 
  ChevronDown, 
  ChevronRight,
  LogOut,
  Store,
  TrendingUp,
  Users
} from 'lucide-react'

const VendorSidebar = () => {
  const [expandedMenus, setExpandedMenus] = useState({})
  const location = useLocation()

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  const menuItems = [
    {
      title: 'Dashboard',
      href: '/vendor/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Products',
      icon: Package,
      submenu: [
        {
          title: 'My Products',
          href: '/vendor/products'
        },
        {
          title: 'Add Product',
          href: '/vendor/products/add'
        },
        {
          title: 'Product Reviews',
          href: '/vendor/products/reviews'
        }
      ]
    },
    {
      title: 'Orders',
      href: '/vendor/orders',
      icon: ShoppingBag
    },
    {
      title: 'Analytics',
      icon: TrendingUp,
      submenu: [
        {
          title: 'Sales Overview',
          href: '/vendor/analytics/sales'
        },
        {
          title: 'Product Performance',
          href: '/vendor/analytics/products'
        },
        {
          title: 'Customer Insights',
          href: '/vendor/analytics/customers'
        }
      ]
    },
    {
      title: 'Earnings',
      href: '/vendor/earnings',
      icon: DollarSign
    },
    {
      title: 'Reviews',
      href: '/vendor/reviews',
      icon: Star
    },
    {
      title: 'Customers',
      href: '/vendor/customers',
      icon: Users
    },
    {
      title: 'Store Settings',
      href: '/vendor/settings',
      icon: Settings
    }
  ]

  const isActive = (href) => {
    return location.pathname === href
  }

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => location.pathname === item.href)
  }

  return (
    <div className="w-64 bg-gray-900 text-white h-full">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Store className="w-8 h-8 text-primary-400" />
          <h2 className="text-2xl font-bold">Vendor Panel</h2>
        </div>
      </div>

      <nav className="px-4 pb-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const hasSubmenu = item.submenu
            const isExpanded = expandedMenus[item.title]
            const isItemActive = item.href ? isActive(item.href) : false
            const isSubActive = hasSubmenu ? isSubmenuActive(item.submenu) : false

            return (
              <li key={item.title}>
                {hasSubmenu ? (
                  <div>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isSubActive
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {isExpanded && (
                      <ul className="mt-2 ml-4 space-y-1">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.title}>
                            <Link
                              to={subItem.href}
                              className={`block px-4 py-2 rounded-lg transition-colors ${
                                isActive(subItem.href)
                                  ? 'bg-gray-800 text-white'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              {subItem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isItemActive
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <Link
          to="/logout"
          className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </div>
  )
}

export default VendorSidebar
