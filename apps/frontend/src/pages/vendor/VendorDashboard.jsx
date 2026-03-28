import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users,
  Eye,
  Calendar,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Home
} from 'lucide-react'
import { useQuery } from 'react-query'
import { vendorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const VendorDashboard = () => {
  const [timeRange, setTimeRange] = useState('30d')

  // Fetch dashboard stats
  const { data: dashboardData, isLoading } = useQuery(
    ['vendorDashboard', timeRange],
    () => vendorAPI.getDashboard({ timeRange }),
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

  const getChangeIcon = (change) => {
    return change >= 0 ? (
      <ArrowUp className="w-4 h-4 text-success-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-error-600" />
    )
  }

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-success-600' : 'text-error-600'
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Overview of your store performance</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Home Button */}
          <Link 
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="hidden sm:inline">Go Home</span>
            <span className="sm:hidden">Home</span>
          </Link>
          
          {/* Time Range Selector */}
          <div className="relative min-w-[140px] w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="input appearance-none pr-10 w-full"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <MoreHorizontal className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(dashboard?.revenueChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(dashboard?.revenueChange || 0)}`}>
                {Math.abs(dashboard?.revenueChange || 0)}%
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(dashboard?.totalRevenue || 0)}
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(dashboard?.ordersChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(dashboard?.ordersChange || 0)}`}>
                {Math.abs(dashboard?.ordersChange || 0)}%
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(dashboard?.totalOrders || 0)}
            </p>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Package className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(dashboard?.productsChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(dashboard?.productsChange || 0)}`}>
                {Math.abs(dashboard?.productsChange || 0)}%
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(dashboard?.totalProducts || 0)}
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(dashboard?.customersChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(dashboard?.customersChange || 0)}`}>
                {Math.abs(dashboard?.customersChange || 0)}%
              </span>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(dashboard?.totalCustomers || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link 
                to="/vendor/orders"
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

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
              <Link 
                to="/vendor/products"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Manage Products
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {dashboard?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product._id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.images?.[0]?.url || '/api/placeholder/100/100'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.soldCount} sold
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.stock} in stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No products available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/vendor/products/new"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                Add Product
              </h3>
              <p className="text-sm text-gray-600">
                List a new product
              </p>
            </div>
          </div>
        </Link>

        <Link 
          to="/vendor/orders"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
              <Eye className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-success-600 transition-colors">
                View Orders
              </h3>
              <p className="text-sm text-gray-600">
                Manage all orders
              </p>
            </div>
          </div>
        </Link>

        <Link 
          to="/vendor/earnings"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-warning-100 rounded-lg group-hover:bg-warning-200 transition-colors">
              <TrendingUp className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-warning-600 transition-colors">
                View Earnings
              </h3>
              <p className="text-sm text-gray-600">
                Track your revenue
              </p>
            </div>
          </div>
        </Link>

        <Link 
          to="/vendor/profile"
          className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                Store Settings
              </h3>
              <p className="text-sm text-gray-600">
                Update your profile
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default VendorDashboard
