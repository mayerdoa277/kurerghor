import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Package,
  Plus,
  Trash2
} from 'lucide-react'
import { useMutation, useQuery } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

const AdminProductAdd = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    trackQuantity: true,
    quantity: '',
    allowBackorder: false,
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    categoryId: '',
    vendorId: '',
    status: 'active',
    tags: '',
    seoTitle: '',
    seoDescription: '',
    images: []
  })
  const [previewImages, setPreviewImages] = useState([])
  const [errors, setErrors] = useState({})
  const [tagInput, setTagInput] = useState('')

  const { data: categoriesData } = useQuery(
    'adminCategoriesForProduct',
    () => adminAPI.getCategories({ page: 1, limit: 100 }),
    { staleTime: 30 * 1000 }
  )

  const { data: vendorsData } = useQuery(
    'adminVendorsForProduct',
    () => adminAPI.getVendors({ page: 1, limit: 100 }),
    { staleTime: 30 * 1000 }
  )

  const categories = categoriesData?.data?.categories || []
  const vendors = vendorsData?.data?.vendors || []

  const createProductMutation = useMutation(
    adminAPI.createProduct,
    {
      onSuccess: () => {
        navigate('/admin/products')
      },
      onError: (error) => {
        setErrors(error.response?.data?.errors || {})
      }
    }
  )

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const fieldValue = type === 'checkbox' ? checked : value
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({
        ...prev,
        slug
      }))
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleDimensionChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [field]: value
      }
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          images: 'Each image should be less than 5MB'
        }))
        return false
      }
      return true
    })

    const newImages = [...formData.images, ...validFiles]
    setFormData(prev => ({
      ...prev,
      images: newImages
    }))

    // Create preview URLs
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
    setPreviewImages(prev => {
      const newPreviews = prev.filter((_, i) => i !== index)
      // Revoke the removed URL to free memory
      if (prev[index]) {
        URL.revokeObjectURL(prev[index])
      }
      return newPreviews
    })
  }

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const formDataToSubmit = new FormData()
    
    // Add all basic fields
    Object.keys(formData).forEach(key => {
      if (key === 'dimensions') {
        formDataToSubmit.append('dimensions', JSON.stringify(formData.dimensions))
      } else if (key === 'tags') {
        formDataToSubmit.append('tags', JSON.stringify(formData.tags))
      } else if (key !== 'images') {
        formDataToSubmit.append(key, formData[key])
      }
    })

    // Add images
    formData.images.forEach((image, index) => {
      formDataToSubmit.append(`images`, image)
    })

    createProductMutation.mutate(formDataToSubmit)
  }

  if (createProductMutation.isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
        <p className="text-gray-600">Create a new product for your store</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input ${errors.name ? 'border-error-500' : ''}`}
                  placeholder="Enter product name"
                  required
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`input ${errors.slug ? 'border-error-500' : ''}`}
                  placeholder="product-url-slug"
                  required
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-error-600">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="input"
                placeholder="Describe your product..."
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`input pl-8 ${errors.price ? 'border-error-500' : ''}`}
                    placeholder="0.00"
                    required
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-error-600">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compare at Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="comparePrice"
                    value={formData.comparePrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="input pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="SKU-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="1234567890"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="trackQuantity"
                    checked={formData.trackQuantity}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Track quantity</span>
                </label>
              </div>

              {formData.trackQuantity && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    min="0"
                    className="input"
                    placeholder="0"
                    required={formData.trackQuantity}
                  />
                </div>
              )}
            </div>

            <div className="mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Allow backorder</span>
              </label>
            </div>
          </div>

          {/* Product Organization */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Organization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={`input ${errors.categoryId ? 'border-error-500' : ''}`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-error-600">{errors.categoryId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.storeName || vendor.owner?.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="input"
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                  className="input flex-1"
                  placeholder="Add a tag..."
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="btn-secondary"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleTagRemove(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={formData.dimensions.length}
                    onChange={(e) => handleDimensionChange('length', e.target.value)}
                    step="0.1"
                    min="0"
                    className="input"
                    placeholder="Length"
                  />
                  <input
                    type="number"
                    value={formData.dimensions.width}
                    onChange={(e) => handleDimensionChange('width', e.target.value)}
                    step="0.1"
                    min="0"
                    className="input"
                    placeholder="Width"
                  />
                  <input
                    type="number"
                    value={formData.dimensions.height}
                    onChange={(e) => handleDimensionChange('height', e.target.value)}
                    step="0.1"
                    min="0"
                    className="input"
                    placeholder="Height"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="product-images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="product-images"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 5MB each
                </span>
              </label>
            </div>
            {errors.images && (
              <p className="mt-2 text-sm text-error-600">{errors.images}</p>
            )}

            {previewImages.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-error-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows="3"
                  className="input"
                  placeholder="SEO description for search engines"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/products')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createProductMutation.isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Create Product</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminProductAdd
