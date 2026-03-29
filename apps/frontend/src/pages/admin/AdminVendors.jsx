import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Store, 
  Mail, 
  CheckCircle, 
  XCircle,
  Clock,
  MoreHorizontal,
  Eye,
  User,
  ChevronDown
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import Pagination from '../../components/Pagination'

const AdminVendors = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending') // Default to pending
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewData, setReviewData] = useState({ rejectionReason: '' })
  const queryClient = useQueryClient()
  const inputRef = useRef(null)
  const modalRef = useRef(null)

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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDetailsModal(false)
      }
    }

    if (showDetailsModal) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDetailsModal])

  // Force focus persistence
  useEffect(() => {
    inputRef.current?.focus()
  }, [debouncedSearchQuery])

  const { data: vendorsData, isLoading, error } = useQuery(
    ['adminVendorRequests', currentPage, debouncedSearchQuery, statusFilter],
    () => adminAPI.getVendorRequests({
      page: currentPage,
      search: debouncedSearchQuery,
      status: statusFilter
    }),
    { 
      staleTime: 30 * 1000,
      keepPreviousData: true, // VERY IMPORTANT - prevents UI flicker
      refetchOnWindowFocus: false,
      refetchInterval: 10000 // Poll every 10 seconds for live updates
    }
  )

  const { data: stats } = useQuery(
    'adminVendorStats',
    () => adminAPI.getVendorRequestStats(),
    { 
      staleTime: 60 * 1000,
      refetchInterval: 10000 // Poll every 10 seconds for live stats
    }
  )

  const approveMutation = useMutation(
    (data) => adminAPI.approveVendorRequest(data.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminVendorRequests')
        queryClient.invalidateQueries('adminVendorStats') // Refresh stats
        queryClient.invalidateQueries('adminVendorsForProduct') // Refresh vendors in Product Add
        queryClient.refetchQueries('adminVendorsForProduct') // Force immediate refresh
        setShowReviewModal(false)
        setSelectedRequest(null)
        setReviewData({ rejectionReason: '' })
      }
    }
  )

  const rejectMutation = useMutation(
    (data) => adminAPI.rejectVendorRequest(data.id, { 
      rejectionReason: data.rejectionReason
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('adminVendorRequests')
        queryClient.invalidateQueries('adminVendorStats') // Refresh stats
        queryClient.invalidateQueries('adminVendorsForProduct') // Refresh vendors in Product Add
        queryClient.refetchQueries('adminVendorsForProduct') // Force immediate refresh
        setShowReviewModal(false)
        setSelectedRequest(null)
        setReviewData({ rejectionReason: '' })
      }
    }
  )

  const vendorRequests = vendorsData?.data?.data?.requests || []
  const pagination = vendorsData?.data?.data?.pagination

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-warning-600 bg-warning-50'
      case 'approved': return 'text-success-600 bg-success-50'
      case 'rejected': return 'text-error-600 bg-error-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Store className="w-4 h-4" />
    }
  }

  const handleApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate({
        id: selectedRequest._id
      })
    }
  }

  const handleReject = () => {
    if (selectedRequest && reviewData.rejectionReason) {
      rejectMutation.mutate({
        id: selectedRequest._id,
        rejectionReason: reviewData.rejectionReason
      })
    }
  }

  const openReviewModal = (request, action) => {
    setSelectedRequest(request)
    setShowReviewModal(true)
    if (action === 'approve') {
      setReviewData({ rejectionReason: '', isApproval: true })
    } else if (action === 'reject') {
      setReviewData({ rejectionReason: '', isApproval: false })
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Requests</h1>
        <p className="text-gray-600">{vendorRequests.length} requests</p>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{stats.data.data.total}</div>
              <div className="text-sm text-gray-500">Total Requests</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-warning-600">{stats.data.data.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-success-600">{stats.data.data.approved}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-2xl font-bold text-error-600">{stats.data.data.rejected}</div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="search-icon" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search vendors..."
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
        </div>
      </div>

      {/* Vendor Requests Table */}
      {vendorRequests.length > 0 ? (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorRequests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center bg-primary-100">
                              <Store className="w-5 h-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.shopName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.businessType}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.user?.email || request.shopEmail}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRequest(request)
                            setShowDetailsModal(true)
                          }}
                          className="group relative inline-flex items-center justify-center p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                          title="View Application Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            View Details
                          </span>
                        </button>
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
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No vendor requests found</h3>
          <p className="text-gray-600">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-100" ref={modalRef}>
            {/* Header with gradient and status */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Store className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold mb-1">Vendor Application</h3>
                        <p className="text-white text-opacity-90">Application ID: #{selectedRequest._id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 backdrop-blur-sm ${
                        selectedRequest.status === 'pending' ? 'bg-yellow-400 text-yellow-900' :
                        selectedRequest.status === 'approved' ? 'bg-green-400 text-green-900' :
                        'bg-red-400 text-red-900'
                      }`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span>{selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}</span>
                      </span>
                      <div className="flex items-center space-x-2 text-white text-opacity-90">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(selectedRequest.requestedAt).toLocaleDateString()} • {new Date(selectedRequest.requestedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            openReviewModal(selectedRequest, 'approve')
                            setShowDetailsModal(false)
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            openReviewModal(selectedRequest, 'reject')
                            setShowDetailsModal(false)
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="p-3 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200 backdrop-blur-sm"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content with tabs */}
            <div className="flex flex-col h-[calc(95vh-200px)]">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 bg-gray-50 px-8">
                <div className="flex space-x-8">
                  <button className="py-4 px-2 border-b-2 border-indigo-600 text-indigo-600 font-medium text-sm">
                    Application Details
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content - 2 columns */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Business Information Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                          <Store className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Business Information</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop Name</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{selectedRequest.shopName}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Type</label>
                            <p className="text-gray-900 mt-1">{selectedRequest.businessType}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
                            <p className="text-gray-900 mt-1">{selectedRequest.shopPhone}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                            <p className="text-gray-900 mt-1">{selectedRequest.shopEmail}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Address</label>
                            <p className="text-gray-900 mt-1">{selectedRequest.shopAddress}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Business Description</label>
                        <div className="mt-2 p-4 bg-white rounded-xl border border-gray-200">
                          <p className="text-gray-900 leading-relaxed">{selectedRequest.shopDescription}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center mr-4">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Application Timeline</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Application Submitted</p>
                              <p className="text-sm text-gray-500">Initial application received</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {new Date(selectedRequest.requestedAt).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(selectedRequest.requestedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        {selectedRequest.reviewedAt && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Last Reviewed</p>
                                <p className="text-sm text-gray-500">Application processed</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">
                                {new Date(selectedRequest.reviewedAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(selectedRequest.reviewedAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {selectedRequest.reviewNotes && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <label className="text-xs font-semibold text-blue-900 uppercase tracking-wider">Review Notes</label>
                          <p className="text-blue-900 mt-2 leading-relaxed">{selectedRequest.reviewNotes}</p>
                        </div>
                      )}
                      
                      {selectedRequest.rejectionReason && (
                        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-200">
                          <label className="text-xs font-semibold text-red-900 uppercase tracking-wider">Rejection Reason</label>
                          <p className="text-red-900 mt-2 leading-relaxed">{selectedRequest.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sidebar - 1 column */}
                  <div className="space-y-6">
                    {/* Owner Information Card */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Owner Details</h4>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                          </div>
                          <p className="font-bold text-lg text-gray-900">{selectedRequest.user?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">Account Owner</p>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-purple-200">
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                            <p className="text-gray-900 mt-1">{selectedRequest.user?.email || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</label>
                            <p className="text-xs font-mono text-gray-900 bg-gray-100 p-2 rounded-lg mt-1">
                              {selectedRequest.user?._id || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(selectedRequest.updatedAt).toLocaleDateString()}
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {reviewData.isApproval ? 'Approve Vendor Request' : 'Reject Vendor Request'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {reviewData.isApproval ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  value={reviewData.rejectionReason}
                  onChange={(e) => setReviewData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder={reviewData.isApproval ? 'Add approval notes (optional)' : 'Required: Please provide rejection reason'}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              
              {reviewData.isApproval ? (
                <button
                  onClick={handleApprove}
                  disabled={approveMutation.isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {approveMutation.isLoading ? 'Approving...' : 'Approve'}
                </button>
              ) : (
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isLoading || !reviewData.rejectionReason}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {rejectMutation.isLoading ? 'Rejecting...' : 'Reject'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminVendors
