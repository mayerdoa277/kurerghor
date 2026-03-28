import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Package,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { vendorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Pagination from '../../components/Pagination'
import toast from 'react-hot-toast'

const VendorProducts = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const queryClient = useQueryClient()

  // Fetch vendor products
  const { data: productsData, isLoading } = useQuery(
    ['vendorProducts', currentPage, searchQuery, statusFilter],
    () => vendorAPI.getProducts({
      page: currentPage,
      search: searchQuery,
      status: statusFilter
    }),
    { staleTime: 2 * 60 * 1000 }
  )

  // Delete product mutation
  const deleteProductMutation = useMutation(
    vendorAPI.deleteProduct,
    {
      onSuccess: () => {
        toast.success('Product deleted successfully!')
        queryClient.invalidateQueries('vendorProducts')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete product')
      }
    }
  )

  const products = productsData?.data?.products || []
  const pagination = productsData?.data?.pagination

  const statusOptions = [
    { value: '', label: 'All Products' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      await deleteProductMutation.mutateAsync(productId)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success-600 bg-success-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      case 'out_of_stock':
        return 'text-error-600 bg-error-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <TrendingUp className="w-4 h-4" />
      case 'inactive':
        return <AlertCircle className="w-4 h-4" />
      case 'out_of_stock':
        return <Package className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
          <p className="text-gray-600">
            {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Link 
          to="/vendor/products/add"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="search-input w-full"
              />
            </div>
          </form>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="input"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      {products.length > 0 ? (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="p-4">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={product.images?.[0]?.url || '/api/placeholder/300/300'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Status Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(product.status)}`}>
                        {getStatusIcon(product.status)}
                        <span>{product.status.replace('_', ' ').charAt(0).toUpperCase() + product.status.replace('_', ' ').slice(1)}</span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        
                        <div className="text-sm text-gray-600">
                          <p>{product.stock} in stock</p>
                          <p>{product.soldCount} sold</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/vendor/products/${product._id}/edit`}
                          className="btn-outline flex items-center space-x-2 text-sm"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deleteProductMutation.isLoading}
                          className="btn-outline flex items-center space-x-2 text-sm text-error-600 hover:bg-error-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={product.images?.[0]?.url || '/api/placeholder/100/100'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(product.status)}`}>
                            {getStatusIcon(product.status)}
                            <span>{product.status.replace('_', ' ').charAt(0).toUpperCase() + product.status.replace('_', ' ').slice(1)}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <p>Price</p>
                            <p className="font-semibold text-gray-900">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p>Stock</p>
                            <p className="font-semibold text-gray-900">
                              {product.stock}
                            </p>
                          </div>
                          <div>
                            <p>Sold</p>
                            <p className="font-semibold text-gray-900">
                              {product.soldCount}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link
                          to={`/vendor/products/${product._id}/edit`}
                          className="btn-outline flex items-center space-x-2"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </Link>
                        
                        <Link
                          to={`/products/${product.slug}`}
                          className="btn-outline flex items-center space-x-2"
                          target="_blank"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Link>
                        
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deleteProductMutation.isLoading}
                          className="btn-outline flex items-center space-x-2 text-error-600 hover:bg-error-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
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
        // Empty State
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-8">
            {statusFilter 
              ? `No ${statusFilter} products found.`
              : "You haven't added any products yet."
            }
          </p>
          <Link 
            to="/vendor/products/add"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Your First Product</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default VendorProducts
