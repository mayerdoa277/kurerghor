import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  Eye,
  MoreHorizontal
} from 'lucide-react'
import { useQuery } from 'react-query'
import { vendorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Pagination from '../../components/Pagination'

const VendorOrders = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: ordersData, isLoading } = useQuery(
    ['vendorOrders', currentPage, searchQuery, statusFilter],
    () => vendorAPI.getOrders({
      page: currentPage,
      search: searchQuery,
      status: statusFilter
    }),
    { staleTime: 30 * 1000 }
  )

  const orders = ordersData?.data?.orders || []
  const pagination = ordersData?.data?.pagination

  const statusOptions = [
    { value: '', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'paid': return <CheckCircle className="w-5 h-5 text-blue-500" />
      case 'processing': return <Package className="w-5 h-5 text-purple-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-indigo-500" />
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />
      default: return <Package className="w-5 h-5 text-gray-500" />
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Orders</h1>
        <p className="text-gray-600">{orders.length} orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="search-input w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">{order.createdAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</p>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="text-sm text-gray-600">{order.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>{order.items.length} items</p>
                    <p>{order.customer?.name || 'Customer'}</p>
                  </div>
                  
                  <Link
                    to={`/vendor/orders/${order._id}`}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-8">
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">You don't have any orders yet.</p>
        </div>
      )}
    </div>
  )
}

export default VendorOrders
