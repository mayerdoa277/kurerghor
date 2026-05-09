import { useState, useEffect, useCallback, useRef } from 'react'
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
  CheckCircle2,
  Layers,
  FileText,
  BarChart3
} from 'lucide-react'
import { useQuery, useQueryClient } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Pagination from '../../components/Pagination'
import UploadProgressBar from '../../components/UploadProgressBar'
import { useSocket } from '../../contexts/SocketContext'

// Initialize state from sessionStorage to prevent flickering on redirect
const getInitialUploadState = () => {
  try {
    const data = sessionStorage.getItem('productUploadData')
    const progress = sessionStorage.getItem('productUploadProgress')
    if (data) {
      return {
        isUploading: true,
        uploadData: JSON.parse(data),
        uploadProgress: parseInt(progress || '5')
      }
    }
  } catch (e) {
    console.error('Error reading initial upload state:', e)
  }
  return { isUploading: false, uploadData: null, uploadProgress: 0 }
}

const initialUploadState = getInitialUploadState()

const AdminProducts = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [vendorFilter, setVendorFilter] = useState('')
  const inputRef = useRef(null)
  const [uploadProgress, setUploadProgress] = useState(initialUploadState.uploadProgress)
  const [isUploading, setIsUploading] = useState(initialUploadState.isUploading)
  const [uploadData, setUploadData] = useState(initialUploadState.uploadData)
  const [showError, setShowError] = useState(false)
  const [errorData, setErrorData] = useState(null)
  const [earlyWebSocketEvents, setEarlyWebSocketEvents] = useState([]) // Buffer for early events
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // Track current image being uploaded
  const [totalImages, setTotalImages] = useState(0) // Track total images
  const queryClient = useQueryClient()
  const { socket, connected } = useSocket()

  const handleUploadDismiss = () => {
    setIsUploading(false)
    setUploadProgress(0)
    setUploadData(null)
    sessionStorage.removeItem('productUploadData')
    sessionStorage.removeItem('productUploadProgress')
    sessionStorage.removeItem('productUploadError')
    queryClient.invalidateQueries('adminProducts')
    queryClient.refetchQueries('adminProducts')
  }

  // Handle search input change - immediate UI update
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value
    setSearchQuery(value) // Update input immediately
  }, [])

  // Debounce search query for API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setCurrentPage(1) // Reset to first page when searching
    }, 300) // Proper debounce timing for stability

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Force focus persistence
  useEffect(() => {
    inputRef.current?.focus()
  }, [debouncedSearchQuery])

  const { data: productsData, isLoading, error } = useQuery(
    ['adminProducts', currentPage, debouncedSearchQuery, statusFilter, vendorFilter],
    () => adminAPI.getProducts({
      page: currentPage,
      search: debouncedSearchQuery,
      status: statusFilter,
      vendor: vendorFilter
    }),
    { 
      staleTime: 30 * 1000,
      keepPreviousData: true, // VERY IMPORTANT - prevents UI flicker
      refetchOnWindowFocus: false
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
    console.log('🔌 Setting up WebSocket listener...', { 
      socket: !!socket, 
      socketType: typeof socket,
      socketMethods: socket ? Object.getOwnPropertyNames(Object.getPrototypeOf(socket)) : 'null',
      connected,
      isUploading, 
      uploadData 
    });
    
    if (!socket) {
      console.log('❌ No socket available');
      return;
    }

    // Wait for socket to be connected before setting up listeners
    if (!connected) {
      console.log('⏳ Socket not connected yet, waiting...');
      return;
    }

    // Double-check socket has the 'on' method
    if (typeof socket.on !== 'function') {
      console.log('❌ Socket does not have "on" method. Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(socket)));
      console.log('🔍 Socket object details:', {
        socket,
        constructor: socket.constructor,
        prototype: Object.getPrototypeOf(socket),
        isSocketIO: socket.constructor && socket.constructor.name === 'Socket'
      });
      return;
    }

    const handleUploadProgress = (data) => {
      console.log('📊 Upload progress via WebSocket:', data);
      
      try {
        // If we receive a 'started' event and no upload is active, start the progress bar
        if (data.status === 'started' && !isUploading && !uploadData) {
          console.log('🚀 Starting progress bar from WebSocket event:', data);
          const uploadInfo = {
            uploadId: data.uploadId,
            productName: data.productName || 'Unknown Product',
            imageCount: data.totalImages || 0,
            startTime: Date.now(),
            status: 'started'
          };
          
          setUploadData(uploadInfo);
          setIsUploading(true);
          setUploadProgress(data.progress || 0);
          setCurrentImageIndex(0); // Reset current image index
          setTotalImages(data.totalImages || 0); // Set total images
          
          // Store in sessionStorage for persistence
          sessionStorage.setItem('productUploadData', JSON.stringify(uploadInfo));
          sessionStorage.setItem('productUploadProgress', (data.progress || 0).toString());
          
          // Process any buffered events
          if (earlyWebSocketEvents.length > 0) {
            console.log('🔄 Processing buffered WebSocket events:', earlyWebSocketEvents.length);
            earlyWebSocketEvents.forEach(event => {
              console.log('🔄 Processing buffered event:', event);
              if (event.status === 'uploading') {
                setUploadProgress(event.progress || 0);
                setCurrentImageIndex(event.currentImage || 0);
                setTotalImages(event.totalImages || 0);
                sessionStorage.setItem('productUploadProgress', (event.progress || 0).toString());
              } else if (event.status === 'processing') {
                setUploadProgress(event.progress || 0);
                sessionStorage.setItem('productUploadProgress', (event.progress || 0).toString());
              } else if (event.status === 'completed') {
                setTimeout(() => {
                  setIsUploading(false);
                  setUploadProgress(0);
                  setUploadData(null);
                  setCurrentImageIndex(0);
                  setTotalImages(0);
                  sessionStorage.removeItem('productUploadData');
                  sessionStorage.removeItem('productUploadProgress');
                  sessionStorage.removeItem('productUploadError');
                  queryClient.invalidateQueries('adminProducts');
                  queryClient.refetchQueries('adminProducts');
                }, 1500);
              } else if (event.status === 'error') {
                setErrorData({
                  error: event.message || 'Upload failed',
                  timestamp: Date.now()
                });
                setShowError(true);
                setIsUploading(false);
                setUploadProgress(0);
                setUploadData(null);
                setCurrentImageIndex(0);
                setTotalImages(0);
                sessionStorage.removeItem('productUploadData');
                sessionStorage.removeItem('productUploadProgress');
              }
            });
            setEarlyWebSocketEvents([]);
          }
          return;
        }
        
        // Update progress if we have an active upload
        if (isUploading && uploadData) {
          console.log('🔄 Updating progress:', data.progress, '%');
          // Update progress with real data from backend
          setUploadProgress(data.progress || 0)
          
          // Update current image tracking if available
          if (data.currentImage && data.totalImages) {
            setCurrentImageIndex(data.currentImage);
            setTotalImages(data.totalImages);
          }
          
          // Store real progress in sessionStorage
          sessionStorage.setItem('productUploadProgress', data.progress.toString())
          
          // Handle completion
          if (data.status === 'completed') {
            console.log('✅ Upload completed via WebSocket')
            setTimeout(() => {
              setIsUploading(false)
              setUploadProgress(0)
              setUploadData(null)
              // Clear sessionStorage
              sessionStorage.removeItem('productUploadData')
              sessionStorage.removeItem('productUploadProgress')
              sessionStorage.removeItem('productUploadError')
              // Refresh products list
              queryClient.invalidateQueries('adminProducts')
              queryClient.refetchQueries('adminProducts')
            }, 1500) // Show completion for 1.5 seconds before clearing
          }
          
          // Handle errors
          if (data.status === 'error') {
            console.error('❌ Upload error via WebSocket:', data.message)
            
            setErrorData({
              error: data.message || 'Upload failed',
              timestamp: Date.now()
            })
            setShowError(true)
            setIsUploading(false)
            setUploadProgress(0)
            setUploadData(null)
            // Clear sessionStorage
            sessionStorage.removeItem('productUploadData')
            sessionStorage.removeItem('productUploadProgress')
          }
        } else {
          console.log('⚠️ Received progress but no active upload:', { isUploading, uploadData });
          // Buffer early events for later processing
          setEarlyWebSocketEvents(prev => [...prev, data])
          console.log('📦 Buffered early WebSocket event:', data);
        }
      } catch (error) {
        console.error('❌ Error in handleUploadProgress:', error)
        
        // Prevent infinite loop with setUploadData error
        if (error.message === 'setUploadData is not defined') {
          console.log('🔄 Ignoring recursive setUploadData error from catch block');
          return
        }
        
        // Store error in sessionStorage for display
        sessionStorage.setItem('productUploadError', JSON.stringify({
          error: error.message || 'Progress tracking failed',
          isNetworkError: false,
          timestamp: Date.now()
        }))
      }
    }

    console.log('👂 Adding socket listener for upload:progress...');
    socket.on('upload:progress', handleUploadProgress)
    
    return () => {
      console.log('🧹 Cleaning up WebSocket listener...');
      if (socket && typeof socket.off === 'function') {
        socket.off('upload:progress', handleUploadProgress)
      }
    }
  }, [socket, connected, isUploading, uploadData])

  // Handle upload progress and errors from sessionStorage
  useEffect(() => {
    let interval = null
    let progressInterval = null
    
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
            console.log('📦 Found upload data, setting up progress bar:', uploadInfo);
            
            // Only update state if not already set (prevents flicker on initial load)
            try {
              if (!uploadData) {
                setUploadData(uploadInfo)
              }
              if (!isUploading) {
                setIsUploading(true)
              }
              
              // Process any buffered WebSocket events
              if (earlyWebSocketEvents.length > 0) {
                console.log('🔄 Processing buffered WebSocket events:', earlyWebSocketEvents.length);
                earlyWebSocketEvents.forEach(event => {
                  console.log('🔄 Processing buffered event:', event);
                  // Re-process the event with the now-ready upload state
                  if (event.stage === 'started') {
                    setUploadProgress(event.progress || 0)
                  } else if (event.stage === 'uploading') {
                    setUploadProgress(event.progress || 0)
                  } else if (event.stage === 'completed') {
                    setTimeout(() => {
                      setIsUploading(false)
                      setUploadProgress(0)
                      setUploadData(null)
                      sessionStorage.removeItem('productUploadData')
                      sessionStorage.removeItem('productUploadProgress')
                      sessionStorage.removeItem('productUploadError')
                      queryClient.invalidateQueries('adminProducts')
                      queryClient.refetchQueries('adminProducts')
                    }, 1500)
                  } else if (event.stage === 'error') {
                    setErrorData({
                      error: event.error || 'Upload failed',
                      timestamp: Date.now()
                    })
                    setShowError(true)
                    setIsUploading(false)
                    setUploadProgress(0)
                    setUploadData(null)
                    sessionStorage.removeItem('productUploadData')
                    sessionStorage.removeItem('productUploadProgress')
                  }
                });
                // Clear the buffer
                setEarlyWebSocketEvents([])
              }
            } catch (setStateError) {
              console.error('❌ Error setting upload data:', setStateError)
              return
            }
            
            // Use real progress from API if available, otherwise estimate
            if (progress && parseInt(progress) > 0) {
              setUploadProgress(parseInt(progress))
            } else {
              // Start with 5% progress to show immediate feedback
              setUploadProgress(5)
              sessionStorage.setItem('productUploadProgress', '5')
            }
            
            // Add fallback timeout to clear progress bar if stuck
            setTimeout(() => {
              if (uploadProgress === 100 && isUploading) {
                console.log('⏰ Fallback: Clearing stuck progress bar at 100%');
                try {
                  setIsUploading(false)
                  setUploadProgress(0)
                  setUploadData(null)
                } catch (clearError) {
                  console.error('❌ Error clearing upload state:', clearError)
                }
                sessionStorage.removeItem('productUploadData')
                sessionStorage.removeItem('productUploadProgress')
                sessionStorage.removeItem('productUploadError')
                queryClient.invalidateQueries('adminProducts')
                queryClient.refetchQueries('adminProducts')
              }
            }, 8000) // 8 second fallback timeout
          } catch (parseError) {
            console.error('❌ Error parsing upload data:', parseError)
            // Clear corrupted data
            sessionStorage.removeItem('productUploadData')
            sessionStorage.removeItem('productUploadProgress')
            try {
              setIsUploading(false)
              setUploadData(null)
            } catch (clearError) {
              console.error('❌ Error clearing state after parse error:', clearError)
            }
          }
        }
        
        if (error) {
          try {
            const errorInfo = JSON.parse(error)
            console.log('❌ Found upload error:', errorInfo);
            
            // Prevent infinite loop with setUploadData error
            if (errorInfo.error === 'setUploadData is not defined') {
              console.log('🔄 Clearing recursive setUploadData error');
              sessionStorage.removeItem('productUploadError')
              return // Don't display this error to user
            }
            
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

    // Simulate progress for better UX
    const simulateProgress = () => {
      if (isUploading && uploadData) {
        const elapsed = Date.now() - uploadData.startTime
        let simulatedProgress = 5 // Start from 5%
        
        if (elapsed < 2000) {
          simulatedProgress = 5 + Math.floor((elapsed / 2000) * 15) // 5-20% in 2s
        } else if (elapsed < 8000) {
          simulatedProgress = 20 + Math.floor(((elapsed - 2000) / 6000) * 60) // 20-80% in 6s
        } else if (elapsed < 12000) {
          simulatedProgress = 80 + Math.floor(((elapsed - 8000) / 4000) * 15) // 80-95% in 4s
        } else {
          simulatedProgress = 95 // Hold at 95%
        }
        
        // Only update if we don't have real progress or if simulated is higher
        const currentProgress = parseInt(sessionStorage.getItem('productUploadProgress') || '0')
        if (simulatedProgress > currentProgress) {
          setUploadProgress(simulatedProgress)
          sessionStorage.setItem('productUploadProgress', simulatedProgress.toString())
        }
      }
    }

    // Handle window focus to recheck upload progress
    const handleWindowFocus = () => {
      console.log('🔄 Window focused, checking upload progress...')
      checkUploadProgress()
    }

    // Check immediately on mount
    checkUploadProgress()
    
    // Also check after short delays to catch any delayed sessionStorage updates
    setTimeout(checkUploadProgress, 50)
    setTimeout(checkUploadProgress, 100)
    setTimeout(checkUploadProgress, 300)
    
    // Only start polling if there's actual upload data
    const hasUploadData = sessionStorage.getItem('productUploadData') || sessionStorage.getItem('productUploadError')
    if (hasUploadData) {
      interval = setInterval(checkUploadProgress, 500)
      progressInterval = setInterval(simulateProgress, 1000) // Update progress every second
    }
    
    // Add window focus listener
    window.addEventListener('focus', handleWindowFocus)
    
    return () => {
      if (interval) {
        clearInterval(interval)
      }
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [])

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

  // Show loading spinner only if not uploading (preserve progress bar during redirect)
  if (isLoading && !isUploading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Upload Progress Bar - sticky at top during upload */}
      {isUploading && uploadData && (
        <div className="sticky top-0 z-50 mb-6 bg-gray-50/80 backdrop-blur-sm py-2 -mx-4 px-4">
          <UploadProgressBar
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadData={uploadData}
            onDismiss={handleUploadDismiss}
            currentImage={currentImageIndex}
            totalImages={totalImages}
          />
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Products</h1>
          </div>
          
          <Link 
            to="/admin/products/add"
            className="btn-primary flex items-center justify-center space-x-2 w-full lg:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Enterprise Stats Bar */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Products Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pagination?.total?.toLocaleString() || products.length.toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Current Page Products Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">On This Page</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Current Page Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current Page</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {pagination?.page || 1} <span className="text-sm font-medium text-gray-400">/ {pagination?.pages || 1}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Per Page Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Per Page</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pagination?.limit || products.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Showing Range Info */}
        {pagination && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">
                {((pagination.page - 1) * pagination.limit) + 1}
              </span> to <span className="font-semibold text-gray-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span> of <span className="font-semibold text-gray-900">
                {pagination.total.toLocaleString()}
              </span> products
            </p>
            <p className="text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="search-input w-full"
              autoComplete="off"
              spellCheck="false"
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
