import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Folder
} from 'lucide-react'
import { useMutation, useQuery } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminCategoryNew = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    status: 'active',
    image: null
  })
  const [previewImage, setPreviewImage] = useState(null)
  const [errors, setErrors] = useState({})

  const { data: categoriesData } = useQuery(
    'adminCategoriesForParent',
    () => adminAPI.getCategories({ page: 1, limit: 100 }),
    { staleTime: 30 * 1000 }
  )

  const categories = categoriesData?.data?.categories || []

  const createCategoryMutation = useMutation(
    adminAPI.createCategory,
    {
      onSuccess: (data) => {
        console.log('Category created successfully:', data)
        toast.success('Category created successfully!')
        navigate('/admin/categories')
      },
      onError: (error) => {
        console.error('Category creation error:', error)
        if (error.response?.data?.error?.includes('duplicate key')) {
          setErrors({ slug: 'This URL slug is already taken. Please use a different name.' })
          toast.error('Category with this name already exists')
        } else {
          setErrors(error.response?.data?.errors || {})
          toast.error('Failed to create category')
        }
      }
    }
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .replace(/-+/g, '-') // Replace multiple dashes with single dash
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'Image size should be less than 5MB'
        }))
        return
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }))

      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }))
    setPreviewImage(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    console.log('Form data before submission:', formData)
    
    const formDataToSubmit = new FormData()
    
    // Only append fields that have values
    Object.keys(formData).forEach(key => {
      if (key === 'image') {
        // Completely skip image field if no file is selected
        if (formData[key] instanceof File) {
          console.log('Appending image file:', formData[key])
          formDataToSubmit.append(key, formData[key])
        } else {
          console.log('Skipping image field - no file selected')
        }
      } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
        console.log(`Appending ${key}:`, formData[key])
        formDataToSubmit.append(key, formData[key])
      }
    })

    // Log FormData contents for debugging
    console.log('FormData contents:')
    for (let [key, value] of formDataToSubmit.entries()) {
      console.log(`${key}:`, value)
    }

    createCategoryMutation.mutate(formDataToSubmit)
  }

  if (createCategoryMutation.isLoading) return <LoadingSpinner />

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/categories')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Category</h1>
        <p className="text-gray-600">Add a new product category to your store</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`input ${errors.name ? 'border-error-500' : ''}`}
                  placeholder="Enter category name"
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
                  placeholder="category-url-slug"
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
                placeholder="Describe this category..."
              />
            </div>
          </div>

          {/* Category Settings */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="input"
                >
                  <option value="">None (Root Category)</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
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
                </select>
              </div>
            </div>
          </div>

          {/* Category Image */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Image</h2>
            
            <div className="flex items-start space-x-6">
              <div className="flex-1">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="category-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="category-image"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload image
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </span>
                  </label>
                </div>
                {errors.image && (
                  <p className="mt-2 text-sm text-error-600">{errors.image}</p>
                )}
              </div>

              {previewImage && (
                <div className="relative">
                  <img
                    src={previewImage}
                    alt="Category preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1 hover:bg-error-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/categories')}
              className="btn-secondary"
              disabled={createCategoryMutation.isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCategoryMutation.isLoading}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{createCategoryMutation.isLoading ? 'Creating...' : 'Create Category'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminCategoryNew
