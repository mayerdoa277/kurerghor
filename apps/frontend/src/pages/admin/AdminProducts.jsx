import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  Plus
} from 'lucide-react'
import { useQuery } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Pagination from '../../components/Pagination'

const AdminProducts = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')

  const { data: productsData, isLoading } = useQuery(
    ['adminProducts', currentPage, searchQuery, statusFilter, vendorFilter],
    () => adminAPI.getProducts({
      page: currentPage,
      search: searchQuery,
      status: statusFilter,
      vendor: vendorFilter
    }),
    { staleTime: 30 * 1000 }
  )

  const { data: vendorsData } = useQuery(
    'adminVendorsForFilter',
    () => adminAPI.getVendors({ page: 1, limit: 100 }),
    { staleTime: 30 * 1000 }
  )

  const products = productsData?.data?.products || []
  const pagination = productsData?.data?.pagination
  const vendors = vendorsData?.data?.vendors || []

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'flagged', label: 'Flagged' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-50'
      case 'inactive': return 'text-gray-600 bg-gray-50'
      case 'pending': return 'text-warning-600 bg-warning-50'
      case 'flagged': return 'text-error-600 bg-error-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Products</h1>
            <p className="text-gray-600">{products.length} products</p>
          </div>
          
          <Link 
            to="/admin/products/add"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
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
          
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="input"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.storeName || vendor.owner?.name || 'Unknown Vendor'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      {products.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {product.images?.[0]?.url ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary-100">
                                <Package className="w-6 h-6 text-primary-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.category?.name || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.vendor?.storeName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.vendor?.owner?.name || ''}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.inventory?.quantity || 0}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/products/${product.slug}`}
                            target="_blank"
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          
                          <Link
                            to={`/admin/products/${product._id}/edit`}
                            className="text-success-600 hover:text-success-900"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          
                          <button className="text-error-600 hover:text-error-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Flagged Products Alert */}
      {products.some(p => p.status === 'flagged') && (
        <div className="mt-8 bg-error-50 border border-error-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-error-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-error-900 mb-2">
                Flagged Products
              </h3>
              <p className="text-error-700 mb-4">
                Some products have been flagged and require review.
              </p>
              <button className="btn-primary">
                Review Flagged Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
