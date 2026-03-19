import { useState } from 'react'
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package,
  Store,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { useQuery } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d')
  const [activeChart, setActiveChart] = useState('revenue')

  const { data: analyticsData, isLoading } = useQuery(
    ['adminAnalytics', timeRange],
    () => adminAPI.getAnalytics({ timeRange }),
    { staleTime: 5 * 60 * 1000 }
  )

  const analytics = analyticsData?.data

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  const chartTypes = [
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'products', label: 'Products', icon: Package }
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
      <TrendingUp className="w-4 h-4 text-success-600" />
    ) : (
      <TrendingUp className="w-4 h-4 text-error-600 transform rotate-180" />
    )
  }

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-success-600' : 'text-error-600'
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Platform performance insights and metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
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
          
          <button className="btn-outline flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(analytics?.revenueChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(analytics?.revenueChange || 0)}`}>
                {Math.abs(analytics?.revenueChange || 0)}%
              </span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(analytics?.totalRevenue || 0)}
          </h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(analytics?.usersChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(analytics?.usersChange || 0)}`}>
                {Math.abs(analytics?.usersChange || 0)}%
              </span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(analytics?.totalUsers || 0)}
          </h3>
          <p className="text-gray-600">Total Users</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Store className="w-6 h-6 text-warning-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(analytics?.vendorsChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(analytics?.vendorsChange || 0)}`}>
                {Math.abs(analytics?.vendorsChange || 0)}%
              </span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(analytics?.totalVendors || 0)}
          </h3>
          <p className="text-gray-600">Total Vendors</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Package className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="flex items-center space-x-1">
              {getChangeIcon(analytics?.productsChange || 0)}
              <span className={`text-sm font-medium ${getChangeColor(analytics?.productsChange || 0)}`}>
                {Math.abs(analytics?.productsChange || 0)}%
              </span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatNumber(analytics?.totalProducts || 0)}
          </h3>
          <p className="text-gray-600">Total Products</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
              
              <div className="flex items-center space-x-2">
                {chartTypes.map((chart) => {
                  const Icon = chart.icon
                  return (
                    <button
                      key={chart.id}
                      onClick={() => setActiveChart(chart.id)}
                      className={`p-2 rounded-lg flex items-center space-x-2 ${
                        activeChart === chart.id
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{chart.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {activeChart.charAt(0).toUpperCase() + activeChart.slice(1)} chart placeholder
                </p>
                <p className="text-sm text-gray-500">
                  Chart showing {activeChart} over {timeRange}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Categories</h2>
          
          <div className="space-y-4">
            {analytics?.topCategories?.slice(0, 5).map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.productCount} products</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(category.revenue)}
                  </p>
                  <p className="text-sm text-gray-600">{category.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* User Growth */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Growth</h2>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">User growth chart placeholder</p>
              <p className="text-sm text-gray-500">New users over time</p>
            </div>
          </div>
        </div>

        {/* Order Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Distribution</h2>
          
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Order distribution chart placeholder</p>
              <p className="text-sm text-gray-500">Orders by category</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        
        <div className="space-y-4">
          {analytics?.recentActivity?.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activity.type === 'order' ? 'bg-success-100' :
                  activity.type === 'user' ? 'bg-primary-100' :
                  activity.type === 'vendor' ? 'bg-warning-100' : 'bg-gray-100'
                }`}>
                  {
                    activity.type === 'order' ? <ShoppingCart className="w-5 h-5 text-success-600" /> :
                    activity.type === 'user' ? <Users className="w-5 h-5 text-primary-600" /> :
                    activity.type === 'vendor' ? <Store className="w-5 h-5 text-warning-600" /> :
                    <Package className="w-5 h-5 text-gray-600" />
                  }
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">{activity.time}</p>
                {activity.value && (
                  <p className="font-medium text-gray-900">{activity.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Conversion Rate</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics?.conversionRate || 0}%
          </p>
          <p className="text-sm text-gray-600">Visitors to customers</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Average Order Value</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(analytics?.averageOrderValue || 0)}
          </p>
          <p className="text-sm text-gray-600">Per transaction</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Retention</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics?.customerRetention || 0}%
          </p>
          <p className="text-sm text-gray-600">Returning customers</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Vendor Performance</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {analytics?.vendorPerformance || 0}%
          </p>
          <p className="text-sm text-gray-600">Active vendors</p>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics
