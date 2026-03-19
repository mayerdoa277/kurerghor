import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  TrendingUp,
  Store,
  UserCheck,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react'
import { useQuery } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d')

  // Fetch admin dashboard stats
  const { data: dashboardData, isLoading } = useQuery(
    ['adminDashboard', timeRange],
    () => adminAPI.getDashboard({ timeRange }),
    { staleTime: 5 * 60 * 1000 }
  )

  const dashboard = dashboardData?.data

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and management</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input"
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <span className="text-sm text-success-600 font-medium">
              +{dashboard?.revenueChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(dashboard?.totalRevenue || 0)}
          </h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm text-primary-600 font-medium">
              +{dashboard?.usersChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(dashboard?.totalUsers || 0)}
          </h3>
          <p className="text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Store className="w-6 h-6 text-warning-600" />
            </div>
            <span className="text-sm text-warning-600 font-medium">
              +{dashboard?.vendorsChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(dashboard?.totalVendors || 0)}
          </h3>
          <p className="text-gray-600">Total Vendors</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-sm text-indigo-600 font-medium">
              +{dashboard?.productsChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(dashboard?.totalProducts || 0)}
          </h3>
          <p className="text-gray-600">Total Products</p>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link 
                to="/admin/orders"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {dashboard?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentOrders.slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        #{order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {order.customer?.name || 'Guest'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Vendors */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pending Vendors</h2>
              <Link 
                to="/admin/vendors"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {dashboard?.pendingVendors?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.pendingVendors.slice(0, 5).map((vendor) => (
                  <div key={vendor._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {vendor.storeName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {vendor.email}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <span className="px-2 py-1 bg-warning-100 text-warning-800 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No pending vendors</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/admin/users"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                Manage Users
              </h3>
              <p className="text-sm text-gray-600">
                View and manage all users
              </p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/vendors"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-warning-100 rounded-lg group-hover:bg-warning-200 transition-colors">
              <Store className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-warning-600 transition-colors">
                Manage Vendors
              </h3>
              <p className="text-sm text-gray-600">
                Approve and manage vendors
              </p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/products"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Manage Products
              </h3>
              <p className="text-sm text-gray-600">
                Review and manage products
              </p>
            </div>
          </div>
        </Link>

        <Link 
          to="/admin/orders"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
              <ShoppingCart className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-success-600 transition-colors">
                Manage Orders
              </h3>
              <p className="text-sm text-gray-600">
                View and manage orders
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* System Alerts */}
      {dashboard?.alerts?.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">System Alerts</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {dashboard.alerts.map((alert, index) => (
                <div key={index} className="flex items-center space-x-3 p-4 bg-error-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-error-900">{alert.title}</p>
                    <p className="text-sm text-error-700">{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
