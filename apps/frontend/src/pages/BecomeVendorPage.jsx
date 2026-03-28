import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Mail, Phone, FileText, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { userAPI } from '../services/api'
import toast from 'react-hot-toast'

const BecomeVendorPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { updateUserRole } = useAuthStore.getState()
  
  const [formData, setFormData] = useState({
    shopName: '',
    shopDescription: '',
    shopAddress: '',
    shopPhone: '',
    shopEmail: '',
    businessType: 'individual',
    taxId: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [vendorRequestStatus, setVendorRequestStatus] = useState(null)
  const [statusLoading, setStatusLoading] = useState(true)

  const businessTypes = [
    { value: 'individual', label: 'Individual Seller' },
    { value: 'company', label: 'Registered Company' },
    { value: 'partnership', label: 'Partnership' }
  ]

  // Fetch vendor request status on component mount
  useEffect(() => {
    const fetchVendorRequestStatus = async () => {
      try {
        const status = await userAPI.getVendorRequestStatus()
        setVendorRequestStatus(status.data.data)
      } catch (error) {
        console.error('Error fetching vendor request status:', error)
      } finally {
        setStatusLoading(false)
      }
    }

    if (user) {
      fetchVendorRequestStatus()
    }
  }, [user])

  // Update user role if they become a vendor
  useEffect(() => {
    if (vendorRequestStatus?.hasRequest && vendorRequestStatus.request.status === 'approved') {
      // Update the user role in the store
      updateUserRole('vendor')
    }
  }, [vendorRequestStatus, updateUserRole])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.shopName?.trim()) {
      newErrors.shopName = 'Store name is required'
    } else if (formData.shopName.trim().length < 2) {
      newErrors.shopName = 'Store name must be at least 2 characters'
    } else if (formData.shopName.trim().length > 100) {
      newErrors.shopName = 'Store name cannot exceed 100 characters'
    }
    
    if (!formData.shopDescription?.trim()) {
      newErrors.shopDescription = 'Business description is required'
    } else if (formData.shopDescription.trim().length < 10) {
      newErrors.shopDescription = 'Description must be at least 10 characters'
    } else if (formData.shopDescription.trim().length > 1000) {
      newErrors.shopDescription = 'Description cannot exceed 1000 characters'
    }
    
    if (!formData.shopAddress?.trim()) {
      newErrors.shopAddress = 'Business address is required'
    } else if (formData.shopAddress.trim().length < 10) {
      newErrors.shopAddress = 'Address must be at least 10 characters'
    } else if (formData.shopAddress.trim().length > 500) {
      newErrors.shopAddress = 'Address cannot exceed 500 characters'
    }
    
    if (!formData.shopPhone?.trim()) {
      newErrors.shopPhone = 'Business phone is required'
    } else if (!/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/.test(formData.shopPhone.trim())) {
      newErrors.shopPhone = 'Please provide a valid phone number'
    }
    
    if (!formData.shopEmail?.trim()) {
      newErrors.shopEmail = 'Business email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shopEmail.trim())) {
      newErrors.shopEmail = 'Please provide a valid email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setIsLoading(true)
    
    try {
      // Only include non-empty optional fields
      const submissionData = {
        shopName: formData.shopName,
        shopDescription: formData.shopDescription,
        shopAddress: formData.shopAddress,
        shopPhone: formData.shopPhone,
        shopEmail: formData.shopEmail,
        businessType: formData.businessType || 'individual'
      }
      
      // Only add taxId if it's not empty
      if (formData.taxId && formData.taxId.trim()) {
        submissionData.taxId = formData.taxId.trim()
      }
      
      const result = await userAPI.requestVendorAccess(submissionData)
      
      if (result.data.success) {
        toast.success(result.data.message || 'Vendor request submitted successfully!')
        navigate('/profile?vendor-request=pending')
      } else {
        toast.error(result.data.error || 'Failed to submit application')
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit application. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (!user) {
    navigate('/login')
    return null
  }

  // Show loading state while checking vendor request status
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If user is already a vendor, redirect to vendor dashboard
  if (user.role === 'vendor') {
    navigate('/vendor/dashboard')
    return null
  }

  // Show status based on vendor request
  if (vendorRequestStatus?.hasRequest) {
    const request = vendorRequestStatus.request
    
    if (request.status === 'pending') {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Your vendor application is pending
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Your application is currently under review. We'll notify you once a decision has been made.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Application submitted:</strong> {new Date(request.requestedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Shop name:</strong> {request.shopName}
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="btn-primary"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    if (request.status === 'rejected') {
      return (
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-6">
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Your vendor application was rejected
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  We're sorry, but your application was not approved at this time.
                </p>
                {request.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800">
                      <strong>Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Application submitted:</strong> {new Date(request.requestedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Shop name:</strong> {request.shopName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Reviewed on:</strong> {new Date(request.reviewedAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* Calculate days remaining until can reapply */}
              {(() => {
                const daysSinceRejection = Math.floor(
                  (Date.now() - new Date(request.reviewedAt)) / (1000 * 60 * 60 * 24)
                );
                const daysRemaining = Math.max(0, 1 - daysSinceRejection);
                const canReapply = daysRemaining === 0;
                
                return (
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => navigate('/profile')}
                      className="btn-secondary"
                    >
                      Back to Profile
                    </button>
                    {canReapply ? (
                      <button
                        onClick={() => {
                          // Clear the form and allow reapplication
                          setVendorRequestStatus(null)
                        }}
                        className="btn-primary"
                      >
                        Reapply Now
                      </button>
                    ) : (
                      <button
                        className="btn-primary opacity-50 cursor-not-allowed"
                        disabled={true}
                        title={`You must wait ${daysRemaining} day${daysRemaining > 1 ? 's' : ''} before reapplying`}
                      >
                        Reapply in {daysRemaining} day{daysRemaining > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <Store className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Become a Vendor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start selling your products on our platform. Join thousands of successful vendors.
          </p>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Why sell with us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Low Fees</h3>
                <p className="text-sm text-gray-600">Competitive commission rates</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Wide Reach</h3>
                <p className="text-sm text-gray-600">Access to thousands of customers</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-gray-900">Easy Management</h3>
                <p className="text-sm text-gray-600">Simple dashboard to manage sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Vendor Application</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Name */}
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-2">
                Store Name *
              </label>
              <input
                type="text"
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                className={`input ${errors.shopName ? 'border-error-500' : ''}`}
                placeholder="Enter your store name"
                required
              />
              {errors.shopName && (
                <p className="mt-1 text-sm text-error-600">{errors.shopName}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                Business Type
              </label>
              <select
                id="businessType"
                name="businessType"
                value={formData.businessType}
                onChange={handleInputChange}
                className="input"
              >
                {businessTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <textarea
                id="shopDescription"
                name="shopDescription"
                value={formData.shopDescription}
                onChange={handleInputChange}
                rows={4}
                className={`input ${errors.shopDescription ? 'border-error-500' : ''}`}
                placeholder="Describe your business, products you plan to sell, and your experience..."
                required
              />
              {errors.shopDescription && (
                <p className="mt-1 text-sm text-error-600">{errors.shopDescription}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Minimum 50 characters. Tell us about your business and what makes you unique.
              </p>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="shopEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Business Email *
              </label>
              <input
                type="email"
                id="shopEmail"
                name="shopEmail"
                value={formData.shopEmail}
                onChange={handleInputChange}
                className={`input ${errors.shopEmail ? 'border-error-500' : ''}`}
                placeholder="business@example.com"
                required
              />
              {errors.shopEmail && (
                <p className="mt-1 text-sm text-error-600">{errors.shopEmail}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="shopPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Business Phone *
              </label>
              <input
                type="tel"
                id="shopPhone"
                name="shopPhone"
                value={formData.shopPhone}
                onChange={handleInputChange}
                className="input"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <textarea
                id="shopAddress"
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleInputChange}
                rows={3}
                className={`input ${errors.shopAddress ? 'border-error-500' : ''}`}
                placeholder="Enter your business address"
                required
              />
              {errors.shopAddress && (
                <p className="mt-1 text-sm text-error-600">{errors.shopAddress}</p>
              )}
            </div>

            {/* Terms */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                By submitting this application, you agree to our vendor terms and conditions. 
                Your application will be reviewed by our team within 3-5 business days.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BecomeVendorPage
