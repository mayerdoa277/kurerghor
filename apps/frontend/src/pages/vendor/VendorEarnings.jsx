import { useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Download,
  Filter
} from 'lucide-react'
import { useQuery } from 'react-query'
import { vendorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const VendorEarnings = () => {
  const [timeRange, setTimeRange] = useState('30d')

  const { data: earningsData, isLoading } = useQuery(
    ['vendorEarnings', timeRange],
    () => vendorAPI.getEarnings({ timeRange }),
    { staleTime: 5 * 60 * 1000 }
  )

  const earnings = earningsData?.data

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

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Earnings</h1>
          <p className="text-gray-600">Track your revenue and payments</p>
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
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <span className="text-sm text-success-600 font-medium">
              +{earnings?.revenueChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(earnings?.totalRevenue || 0)}
          </h3>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
            <span className="text-sm text-primary-600 font-medium">
              +{earnings?.ordersChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {earnings?.totalOrders || 0}
          </h3>
          <p className="text-gray-600">Total Orders</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning-100 rounded-lg">
              <Calendar className="w-6 h-6 text-warning-600" />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              Pending
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {formatCurrency(earnings?.pendingPayments || 0)}
          </h3>
          <p className="text-gray-600">Pending Payments</p>
        </div>
      </div>

      {/* Earnings Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Overview</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-600">Chart placeholder - Revenue over time</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Transactions</h2>
        
        {earnings?.recentTransactions?.length > 0 ? (
          <div className="space-y-4">
            {earnings.recentTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">#{transaction.orderNumber}</p>
                  <p className="text-sm text-gray-600">{transaction.date}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-600">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorEarnings
