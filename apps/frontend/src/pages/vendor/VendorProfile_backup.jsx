import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Camera,
  Store,
  Globe,
  Save,
  DollarSign
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { vendorAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const VendorProfile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    website: '',
    avatar: ''
  })

  const queryClient = useQueryClient()

  // Fetch vendor profile
  const { data: profileData, isLoading } = useQuery(
    'vendorProfile',
    vendorAPI.getProfile,
    { staleTime: 5 * 60 * 1000 }
  )

  // Update profile mutation
  const updateProfileMutation = useMutation(
    vendorAPI.updateProfile,
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        queryClient.invalidateQueries('vendorProfile')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update profile')
      }
    }
  )

  const profile = profileData?.data

  useEffect(() => {
    if (profile) {
      setFormData({
        storeName: profile.storeName || '',
        storeDescription: profile.storeDescription || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        postalCode: profile.postalCode || '',
        country: profile.country || '',
        website: profile.website || '',
        avatar: profile.avatar || ''
      })
    }
  }, [profile])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await updateProfileMutation.mutateAsync(formData)
  }

  if (isLoading) return <LoadingSpinner>()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Profile</h1>
        <p className="text-gray-600">Manage your store information and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Store Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn-outline flex items-center space-x-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Avatar */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {formData.avatar ? (
                      <img
                        src={formData.avatar}
                        alt="Store Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary-100">
                        <Store className="w-12 h-12 text-primary-600" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Store Logo</h3>
                  <p className="text-sm text-gray-600">Upload your store logo</p>
                </div>
              </div>

              {/* Store Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="Your Store Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="store@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Description
                </label>
                <textarea
                  name="storeDescription"
                  value={formData.storeDescription}
                  onChange={handleInputChange}
                  rows={4}
                  className="input resize-none"
                  disabled={!isEditing}
                  placeholder="Tell customers about your store..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="+1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="https://yourstore.com"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="input"
                  disabled={!isEditing}
                  placeholder="123 Commerce Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="10001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="input"
                    disabled={!isEditing}
                    placeholder="United States"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isLoading}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Store Stats */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Stats</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Products</span>
                <span className="font-medium">{profile?.productCount || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Orders</span>
                <span className="font-medium">{profile?.orderCount || 0}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium">
                  {profile?.rating ? profile.rating.toFixed(1) : 'N/A'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">
                  {profile?.createdAt ? new Date(profile.createdAt).getFullYear() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            
            <div className="space-y-3">
              <a
                href="/vendor/products"
                className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Store className="w-4 h-4" />
                <span>Manage Products</span>
              </a>
              
              <a
                href="/vendor/orders"
                className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>View Orders</span>
              </a>
              
              <a
                href="/vendor/earnings"
                className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                <span>Earnings</span>
              </a>
              
              {formData.website && (
                <a
                  href={formData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Store</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorProfile
