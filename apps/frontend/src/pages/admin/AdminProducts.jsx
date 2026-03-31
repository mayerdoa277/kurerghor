import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  AlertCircle,
  Plus,
  Upload,
  CheckCircle2
} from 'lucide-react'
import { useQuery, useQueryClient } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Pagination from '../../components/Pagination'
import { useSocket } from '../../contexts/SocketContext'

const AdminProducts = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadData, setUploadData] = useState(null)
  const [showError, setShowError] = useState(false)
  const [errorData, setErrorData] = useState(null)
  const queryClient = useQueryClient()
  const socket = useSocket()

  const { data: productsData, isLoading, error } = useQuery(
    ['adminProducts', currentPage, searchQuery, statusFilter, vendorFilter],
    () => adminAPI.getProducts({
      page: currentPage,
      search: searchQuery,
      status: statusFilter,
      vendor: vendorFilter
    }),
    { 
      staleTime: 5 * 1000, // Reduced to 5 seconds for more responsive updates
      cacheTime: 10 * 60 * 1000, // 10 minutes cache time
      refetchOnWindowFocus: true,
      refetchOnMount: true
    }
  )

  const { data: vendorsData } = useQuery(
    'adminVendorsForFilter',
    () => adminAPI.getVendors({ page: 1, limit: 100 }),
    { staleTime: 30 * 1000 }
  )

  // Handle different possible response structures
  const products = productsData?.data?.products || 
                   productsData?.products || 
                   productsData?.data?.data?.products ||
                   productsData?.data || []
  
  const pagination = productsData?.data?.pagination || 
                     productsData?.pagination || 
                     productsData?.data?.data?.pagination

  // Debug: Log actual response structure
  console.log('Products API Response:', productsData)
  console.log('Extracted Products:', products)
  console.log('Pagination:', pagination)

  // WebSocket integration for real-time upload progress
  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return

    const handleUploadProgress = (data) => {
      console.log('📊 Upload progress via WebSocket:', data)
      
      // Update progress if this matches our current upload
      if (uploadData && data.uploadId === uploadData.uploadId) {
        setUploadProgress(data.progress)
        setUploadData(prev => ({
          ...prev,
          status: data.status,
          message: data.message,
          currentImage: data.currentImage,
          totalImages: data.totalImages
        }))
        
        // Store in sessionStorage for persistence
        sessionStorage.setItem('productUploadProgress', data.progress.toString())
        
        // Handle completion
        if (data.status === 'completed') {
          setTimeout(() => {
            setIsUploading(false)
            setUploadProgress(0)
            setUploadData(null)
            // Clear session storage
            sessionStorage.removeItem('productUploadData')
            sessionStorage.removeItem('productUploadProgress')
            // Refresh products list
            queryClient.invalidateQueries('adminProducts')
            queryClient.refetchQueries('adminProducts')
          }, 1000)
        }
        
        // Handle errors
        if (data.status === 'error') {
          setIsUploading(false)
          setErrorData({
            error: data.message || data.error,
            isNetworkError: false,
            timestamp: Date.now()
          })
          setShowError(true)
          // Clear progress
          sessionStorage.removeItem('productUploadProgress')
        }
      }
    }

    socket.on('upload:progress', handleUploadProgress)
    
    return () => {
      if (socket && typeof socket.off === 'function') {
        socket.off('upload:progress', handleUploadProgress)
      }
    }
  }, [socket, uploadData, queryClient])

  // Debug: Add manual test trigger (remove in production)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Press 'p' key to test progress bar
      if (e.key === 'p' && e.ctrlKey && e.shiftKey) {
        console.log('🧪 Testing progress bar...')
        const testData = {
          uploadId: `test_${Date.now()}`,
          productName: 'Test Product',
          imageCount: 3,
          startTime: Date.now(),
          status: 'started'
        }
        sessionStorage.setItem('productUploadData', JSON.stringify(testData))
        sessionStorage.setItem('productUploadProgress', '25')
        setUploadData(testData)
        setIsUploading(true)
        setUploadProgress(25)
        
        // Clear after 5 seconds
        setTimeout(() => {
          sessionStorage.removeItem('productUploadData')
          sessionStorage.removeItem('productUploadProgress')
          setIsUploading(false)
          setUploadProgress(0)
          setUploadData(null)
        }, 5000)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Handle upload progress and errors from sessionStorage
  useEffect(() => {
    let interval = null
    
    const checkUploadProgress = () => {
      try {
        const progress = sessionStorage.getItem('productUploadProgress')
        const data = sessionStorage.getItem('productUploadData')
        const error = sessionStorage.getItem('productUploadError')
        
        // Debug logging
        console.log('🔍 Upload Progress Check:', {
          progress,
          data: data ? JSON.parse(data) : null,
          error: error ? JSON.parse(error) : null,
          isUploading,
          uploadProgress,
          uploadData
        })
        
        if (data) {
          try {
            const uploadInfo = JSON.parse(data)
            setUploadData(uploadInfo)
            setIsUploading(true)
            
            // Use real progress from API if available, otherwise estimate
            if (progress && parseInt(progress) > 0) {
              setUploadProgress(parseInt(progress))
            } else {
              // Estimate progress based on time and image count
              const elapsed = Date.now() - uploadInfo.startTime
              const estimatedProgress = Math.min(Math.floor((elapsed / 30000) * 90), 90) // 30s for 90%
              setUploadProgress(estimatedProgress)
              sessionStorage.setItem('productUploadProgress', estimatedProgress.toString())
            }
          } catch (parseError) {
            console.error('❌ Error parsing upload data:', parseError)
            // Clear corrupted data
            sessionStorage.removeItem('productUploadData')
            sessionStorage.removeItem('productUploadProgress')
            setIsUploading(false)
            setUploadData(null)
          }
        }
        
        if (error) {
          try {
            const errorInfo = JSON.parse(error)
            setErrorData(errorInfo)
            setShowError(true)
            setIsUploading(false)
            // Clear progress
            sessionStorage.removeItem('productUploadProgress')
          } catch (parseError) {
            console.error('❌ Error parsing error data:', parseError)
            sessionStorage.removeItem('productUploadError')
          }
        }
        
        // Stop polling if there's no upload data or error
        if (!data && !error && interval) {
          clearInterval(interval)
          interval = null
        }
      } catch (error) {
        console.error('❌ Error checking upload progress:', error)
      }
    }

    // Check immediately
    checkUploadProgress()
    
    // Only start polling if there's actual upload data
    const hasUploadData = sessionStorage.getItem('productUploadData') || sessionStorage.getItem('productUploadError')
    if (hasUploadData) {
      interval = setInterval(checkUploadProgress, 500)
    }
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [])

  // Clear upload data when component unmounts or on successful load
  useEffect(() => {
    if (!isLoading && products.length > 0) {
      // Clear any lingering upload data
      sessionStorage.removeItem('productUploadData')
      sessionStorage.removeItem('productUploadProgress')
      sessionStorage.removeItem('productUploadError')
      setIsUploading(false)
      setUploadProgress(0)
      setUploadData(null)
    }
  }, [isLoading, products.length])

  const handleRetry = () => {
    const storedData = sessionStorage.getItem('productUploadData')
    if (storedData) {
      const uploadInfo = JSON.parse(storedData)
      // Clear previous error
      sessionStorage.removeItem('productUploadError')
      setShowError(false)
      // Navigate back to add product page with retry flag and preserved data
      navigate('/admin/products/add?retry=true&uploadId=' + uploadInfo.uploadId)
    }
  }

  const vendors = vendorsData?.data?.vendors || []

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'deleted', label: 'Deleted' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success-600 bg-success-50'
      case 'draft': return 'text-warning-600 bg-warning-50'
      case 'archived': return 'text-gray-600 bg-gray-50'
      case 'deleted': return 'text-error-600 bg-error-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Upload Progress Bar */}
      {isUploading && uploadData && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
                    <div 
                      className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent border-r-transparent animate-spin"
                      style={{
                        transform: `rotate(${uploadProgress * 3.6}deg)`
                      }}
                    ></div>
                    <div className="absolute inset-1.5 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{uploadProgress}%</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Creating "{uploadData.productName}"</h3>
                    <p className="text-xs text-gray-600">
                      {uploadProgress < 30 
                        ? 'Initializing upload...'
                        : uploadProgress < 80
                        ? `Uploading ${uploadData.imageCount} image${uploadData.imageCount !== 1 ? 's' : ''}...`
                        : uploadProgress < 95
                        ? 'Processing product data...'
                        : 'Finalizing creation...'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-56 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500 rounded-full transition-all duration-500 ease-out relative"
                      style={{ width: `${uploadProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {uploadProgress < 30 
                      ? 'Starting...'
                      : uploadProgress < 80
                      ? 'Uploading...'
                      : uploadProgress < 95
                      ? 'Processing...'
                      : 'Almost done...'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Retry Overlay */}
      {showError && errorData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl border border-gray-200/50">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Upload Failed</h3>
                <p className="text-sm text-gray-600">
                  {errorData.isNetworkError 
                    ? 'The upload failed due to network issues or timeout. Your data is saved and you can retry.'
                    : errorData.error || 'Product creation failed. Please try again.'
                  }
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleRetry}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Retry Upload</span>
                </button>
                <button
                  onClick={() => setShowError(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
