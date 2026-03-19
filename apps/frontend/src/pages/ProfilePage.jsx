import { useState, useEffect } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Edit2, 
  Plus,
  Trash2,
  Camera
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { userAPI } from '../services/api'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore()
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [addresses, setAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    type: 'home',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    isDefault: false
  })

  // Fetch user data
  const { data: userData, isLoading } = useQuery(
    'userProfile',
    userAPI.getMe,
    { staleTime: 5 * 60 * 1000 }
  )

  // Fetch addresses
  const { data: addressesData } = useQuery(
    'userAddresses',
    userAPI.getAddresses,
    { staleTime: 5 * 60 * 1000 }
  )

  // Update profile mutation
  const updateProfileMutation = useMutation(
    userAPI.updateProfile,
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        queryClient.invalidateQueries('userProfile')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update profile')
      }
    }
  )

  // Change password mutation
  const changePasswordMutation = useMutation(
    userAPI.changePassword,
    {
      onSuccess: () => {
        toast.success('Password changed successfully!')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to change password')
      }
    }
  )

  // Add address mutation
  const addAddressMutation = useMutation(
    userAPI.addAddress,
    {
      onSuccess: () => {
        toast.success('Address added successfully!')
        setShowAddressForm(false)
        setAddressForm({
          type: 'home',
          name: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
          country: '',
          isDefault: false
        })
        queryClient.invalidateQueries('userAddresses')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add address')
      }
    }
  )

  // Update address mutation
  const updateAddressMutation = useMutation(
    ({ id, data }) => userAPI.updateAddress(id, data),
    {
      onSuccess: () => {
        toast.success('Address updated successfully!')
        queryClient.invalidateQueries('userAddresses')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update address')
      }
    }
  )

  // Delete address mutation
  const deleteAddressMutation = useMutation(
    userAPI.deleteAddress,
    {
      onSuccess: () => {
        toast.success('Address deleted successfully!')
        queryClient.invalidateQueries('userAddresses')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete address')
      }
    }
  )

  useEffect(() => {
    if (userData?.data) {
      setFormData({
        name: userData.data.name || '',
        email: userData.data.email || '',
        phone: userData.data.phone || '',
        avatar: userData.data.avatar || ''
      })
    }
  }, [userData])

  useEffect(() => {
    if (addressesData?.data) {
      setAddresses(addressesData.data)
    }
  }, [addressesData])

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    
    const profileData = {
      name: formData.name,
      phone: formData.phone,
      avatar: formData.avatar
    }
    
    await updateProfileMutation.mutateAsync(profileData)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    await changePasswordMutation.mutateAsync({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    await addAddressMutation.mutateAsync(addressForm)
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddressMutation.mutateAsync(addressId)
    }
  }

  const handleSetDefaultAddress = async (addressId) => {
    await updateAddressMutation.mutateAsync({
      id: addressId,
      isDefault: true
    })
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {['profile', 'security', 'addresses', 'orders', 'wishlist'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-4 py-3 rounded-lg capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="btn-outline flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-12 h-12 text-gray-400" />
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
                  
                  {isEditing && (
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="input"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{formData.email}</p>
                        <p className="text-sm text-gray-600">Email Address</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{formData.phone || 'Not provided'}</p>
                        <p className="text-sm text-gray-600">Phone Number</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="input"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isLoading}
                      className="btn-primary"
                    >
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
              
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="input"
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="input"
                    placeholder="Enter new password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isLoading}
                    className="btn-primary"
                  >
                    {changePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Shipping Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Add New Address</h3>
                  
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Type
                        </label>
                        <select
                          value={addressForm.type}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, type: e.target.value }))}
                          className="input"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                          className="input"
                          placeholder="Full name"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="input"
                        placeholder="Phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                        className="input"
                        placeholder="Street address"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                          className="input"
                          placeholder="City"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={addressForm.postalCode}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="input"
                          placeholder="Postal code"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                          className="input"
                          placeholder="Country"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="text-sm text-gray-700">
                        Set as default address
                      </label>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="btn-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addAddressMutation.isLoading}
                        className="btn-primary"
                      >
                        {addAddressMutation.isLoading ? 'Adding...' : 'Add Address'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Existing Addresses */}
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div key={address._id} className="bg-white rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="font-semibold text-gray-900 capitalize">{address.type}</h3>
                          {address.isDefault && (
                            <span className="badge-success">Default</span>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>{address.name}</p>
                          <p>{address.phone}</p>
                          <p>{address.address}</p>
                          <p>{address.city}, {address.postalCode}</p>
                          <p>{address.country}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address._id)}
                            className="text-primary-600 hover:text-primary-700 text-sm"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">View your complete order history</p>
                <button
                  onClick={() => window.location.href = '/orders'}
                  className="btn-primary"
                >
                  View All Orders
                </button>
              </div>
            </div>
          )}

          {/* Wishlist Tab */}
          {activeTab === 'wishlist' && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">My Wishlist</h2>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">View your saved items</p>
                <button
                  onClick={() => window.location.href = '/wishlist'}
                  className="btn-primary"
                >
                  View Wishlist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
