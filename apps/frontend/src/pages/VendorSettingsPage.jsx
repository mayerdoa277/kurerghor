import { useState, useEffect } from 'react'
import { 
  Store, 
  CheckCircle, 
  AlertCircle,
  Clock
} from 'lucide-react'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { userAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const VendorSettingsPage = () => {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  
  // Show success message for vendor request submission
  useEffect(() => {
    if (searchParams.get('vendor-request') === 'pending') {
      toast.success('Vendor application submitted successfully! Your application is now under review.')
      // Clean URL parameter
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  // Fetch vendor request status
  const { data: vendorRequestData, isLoading } = useQuery(
    'vendorRequestStatus',
    userAPI.getVendorRequestStatus,
    { 
      enabled: !!user,
      staleTime: 5 * 60 * 1000 
    }
  )

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Settings</h1>
        <p className="text-gray-600">Manage your vendor account and applications</p>
      </div>

      <div className="space-y-6">
        {vendorRequestData?.data?.hasPendingRequest ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h2>
              <p className="text-gray-600 mb-4">
                Your vendor application is currently under review by our team.
              </p>
              <div className="bg-white rounded-lg p-4 border border-yellow-200">
                <h3 className="font-semibold text-gray-900 mb-2">Application Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Shop Name:</strong> {vendorRequestData.data.shopName}</p>
                  <p><strong>Submitted:</strong> {new Date(vendorRequestData.data.requestedAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span className="text-yellow-600 font-medium">Pending Review</span></p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                You will be notified via email once a decision is made. This process typically takes 3-5 business days.
              </p>
            </div>
          </div>
        ) : user?.role === 'vendor' ? (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Account Active</h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! Your vendor account has been approved and is now active.
                </p>
                <button
                  onClick={() => window.location.href = '/vendor/dashboard'}
                  className="btn-primary flex items-center space-x-2 mx-auto"
                >
                  <Store className="w-5 h-5" />
                  <span>Go to Vendor Dashboard</span>
                </button>
              </div>
            </div>

            {/* Vendor Quick Actions */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => window.location.href = '/vendor/products'}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-medium text-gray-900">Manage Products</h4>
                  <p className="text-sm text-gray-600">Add, edit, or remove your products</p>
                </button>
                <button
                  onClick={() => window.location.href = '/vendor/orders'}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-medium text-gray-900">View Orders</h4>
                  <p className="text-sm text-gray-600">Manage and fulfill customer orders</p>
                </button>
                <button
                  onClick={() => window.location.href = '/vendor/earnings'}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-medium text-gray-900">Earnings</h4>
                  <p className="text-sm text-gray-600">Track your revenue and payouts</p>
                </button>
                <button
                  onClick={() => window.location.href = '/vendor/profile'}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
                >
                  <h4 className="font-medium text-gray-900">Vendor Profile</h4>
                  <p className="text-sm text-gray-600">Update your shop information</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center py-8">
              <Store className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Become a Vendor</h2>
              <p className="text-gray-600 mb-6">
                Start selling your products on our platform and reach thousands of customers
              </p>
              <button
                onClick={() => window.location.href = '/become-vendor'}
                className="btn-primary flex items-center space-x-2 mx-auto"
              >
                <Store className="w-5 h-5" />
                <span>Apply to Become a Vendor</span>
              </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Why Sell With Us?</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Reach thousands of potential customers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Easy-to-use seller dashboard</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Marketing and promotion support</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorSettingsPage
