import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft,
  Save,
  Upload,
  X,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Boxes,
  Tags,
  Truck,
  Search,
  Sparkles
} from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { adminAPI } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminProductEdit = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [isDragging, setIsDragging] = useState(false)
  const [activeSection, setActiveSection] = useState('basic')
  const [existingImages, setExistingImages] = useState([])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  const sectionRefs = {
    basic: useRef(null),
    pricing: useRef(null),
    inventory: useRef(null),
    organization: useRef(null),
    shipping: useRef(null),
    images: useRef(null),
    seo: useRef(null)
  }

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '',
    compareAtPrice: '',
    costPrice: '',
    quantity: '',
    trackQuantity: true,
    allowBackorder: false,
    lowStockThreshold: 10,
    status: 'draft',
    visibility: 'public',
    featured: false,
    vendor: '',
    category: '',
    brand: '',
    tags: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    newImages: [],
    freeShipping: false,
    shippingCost: '',
    taxable: true,
    taxRate: ''
  })
  
  const [previewImages, setPreviewImages] = useState([])
  const [errors, setErrors] = useState({})
  const [tagInput, setTagInput] = useState('')

  // Fetch product data using single product API
  const { data: productData, isLoading: productLoading } = useQuery(
    ['adminProduct', id],
    () => adminAPI.getProduct(id).then(res => res.data?.data || res.data),
    {
      enabled: !!id,
      staleTime: 0,
      cacheTime: 0,
      onSuccess: (product) => {
        // Populate form with existing data
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          sku: product.sku || '',
          description: product.description || '',
          price: product.price?.toString() || '',
          compareAtPrice: product.compareAtPrice?.toString() || '',
          costPrice: product.costPrice?.toString() || '',
          quantity: product.inventory?.quantity?.toString() || '',
          trackQuantity: product.inventory?.trackQuantity ?? true,
          allowBackorder: product.inventory?.allowBackorder ?? false,
          lowStockThreshold: product.inventory?.lowStockThreshold?.toString() || '10',
          status: product.status || 'draft',
          visibility: product.visibility || 'public',
          featured: product.featured || false,
          vendor: product.vendor?._id || product.vendor || '',
          category: product.category?._id || product.category || '',
          brand: product.brand || '',
          tags: product.tags || [],
          seoTitle: product.seo?.title || '',
          seoDescription: product.seo?.description || '',
          seoKeywords: product.seo?.keywords?.join(', ') || '',
          weight: product.weight?.value?.toString() || '',
          dimensions: {
            length: product.dimensions?.length?.toString() || '',
            width: product.dimensions?.width?.toString() || '',
            height: product.dimensions?.height?.toString() || ''
          },
          newImages: [],
          freeShipping: product.shipping?.freeShipping || false,
          shippingCost: product.shipping?.shippingCost?.toString() || '',
          taxable: product.tax?.taxable ?? true,
          taxRate: product.tax?.taxRate?.toString() || ''
        })
        setExistingImages(product.images || [])
      },
      onError: (error) => {
        console.error('Error loading product:', error)
        toast.error('Failed to load product')
        navigate('/admin/products')
      }
    }
  )

  const { data: categoriesData } = useQuery(
    'adminCategoriesForProductEdit',
    () => adminAPI.getCategories({ page: 1, limit: 100 }),
    { 
      staleTime: 30 * 1000, // Cache for 30 seconds
      refetchOnWindowFocus: true
    }
  )

  const { data: vendorsData } = useQuery(
    'adminVendorsForProductEdit',
    () => adminAPI.getVendors({ page: 1, limit: 100 }),
    { 
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true
    }
  )

  // Handle the nested response structure
  const categories = categoriesData?.data?.data?.categories || 
                     categoriesData?.data?.categories || 
                     categoriesData?.data?.data || 
                     []
  const vendors = vendorsData?.data?.vendors || 
                  vendorsData?.data?.data?.vendors || 
                  vendorsData?.success?.data?.vendors || 
                  []

  const updateProductMutation = useMutation(
    ({ id, data }) => adminAPI.updateProduct(id, data),
    {
      onSuccess: (data) => {
        toast.success('Product updated successfully!')
        queryClient.invalidateQueries('adminProducts')
        queryClient.invalidateQueries(['adminProduct', id])
        navigate('/admin/products')
      },
      onError: (error) => {
        console.error('Product update error:', error)
        if (error.response?.data?.error?.includes('duplicate key')) {
          setErrors({ slug: 'This URL slug is already taken.' })
          toast.error('Product with this slug already exists')
        } else {
          setErrors(error.response?.data?.errors || {})
          toast.error(error.response?.data?.error || 'Failed to update product')
        }
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

  const scrollToSection = (sectionName) => {
    setActiveSection(sectionName)
    const element = sectionRefs[sectionName]?.current
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Max 5MB.`)
        return false
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image.`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    const totalImages = existingImages.length + formData.newImages.length + validFiles.length - imagesToDelete.length
    if (totalImages > 10) {
      toast.error('Maximum 10 images allowed.')
      return
    }

    setFormData(prev => ({
      ...prev,
      newImages: [...prev.newImages, ...validFiles]
    }))

    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setPreviewImages(prev => [...prev, ...newPreviews])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      const mockEvent = { target: { files: imageFiles } }
      handleImageChange(mockEvent)
    }
  }

  const removeNewImage = (index) => {
    setFormData(prev => ({
      ...prev,
      newImages: prev.newImages.filter((_, i) => i !== index)
    }))
    setPreviewImages(prev => {
      const newPreviews = [...prev]
      URL.revokeObjectURL(newPreviews[index])
      newPreviews.splice(index, 1)
      return newPreviews
    })
  }

  const removeExistingImage = (index) => {
    const imageToRemove = existingImages[index]
    setImagesToDelete(prev => [...prev, imageToRemove])
    setExistingImages(prev => prev.filter((_, i) => i !== index))
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formDataToSubmit = new FormData()
    
    // Add all basic fields
    Object.keys(formData).forEach(key => {
      if (key === 'dimensions') {
        const dimensionsObj = {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0
        }
        formDataToSubmit.append('dimensions', JSON.stringify(dimensionsObj))
      } else if (key === 'tags') {
        formDataToSubmit.append('tags', JSON.stringify(formData.tags))
      } else if (key === 'newImages') {
        // Skip - handled separately
      } else if (key === 'seoTitle' || key === 'seoDescription' || key === 'seoKeywords') {
        // Skip - handled in SEO object
      } else if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
        formDataToSubmit.append(key, formData[key])
      }
    })

    // Add inventory object
    formDataToSubmit.append('inventory', JSON.stringify({
      quantity: parseInt(formData.quantity) || 0,
      trackQuantity: formData.trackQuantity,
      allowBackorder: formData.allowBackorder,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 10
    }))

    // Add SEO object
    formDataToSubmit.append('seo', JSON.stringify({
      title: formData.seoTitle || '',
      description: formData.seoDescription || '',
      keywords: formData.seoKeywords.split(',').map(k => k.trim()).filter(k => k) || []
    }))

    // Add weight object
    if (formData.weight) {
      formDataToSubmit.append('weight', JSON.stringify({
        value: parseFloat(formData.weight) || 0,
        unit: 'kg'
      }))
    }

    // Add shipping object
    formDataToSubmit.append('shipping', JSON.stringify({
      freeShipping: formData.freeShipping,
      shippingCost: parseFloat(formData.shippingCost) || 0
    }))

    // Add tax object
    formDataToSubmit.append('tax', JSON.stringify({
      taxable: formData.taxable,
      taxRate: parseFloat(formData.taxRate) || 0
    }))

    // Add existing images to keep
    const remainingImages = existingImages.map(img => ({
      url: img.url,
      alt: img.alt || '',
      isMain: img.isMain || false
    }))
    formDataToSubmit.append('existingImages', JSON.stringify(remainingImages))

    // Add new images
    formData.newImages.forEach((image) => {
      formDataToSubmit.append('images', image)
    })

    setIsLoading(true)
    try {
      await updateProductMutation.mutateAsync({ id, data: formDataToSubmit })
    } finally {
      setIsLoading(false)
    }
  }

  if (productLoading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/admin/products')}
              className="group flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200 mr-3">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="font-medium">Back to Products</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Editing Product</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="sticky top-16 z-30 bg-white/60 backdrop-blur-md border-b border-gray-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 overflow-x-auto scrollbar-hide">
            {['basic', 'pricing', 'inventory', 'organization', 'shipping', 'images', 'seo'].map((section, index) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`flex items-center px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  activeSection === section
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="capitalize">{section}</span>
                {index < 6 && (
                  <div className="w-4 h-0.5 bg-gray-300 mx-2 hidden sm:block"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-500" />
                Edit Product
              </h1>
              <p className="text-gray-500 mt-1">Update product information and settings</p>
            </div>
            <button
              type="submit"
              disabled={updateProductMutation.isLoading || isLoading}
              className="btn-primary flex items-center space-x-2 px-6 py-3"
            >
              <Save className="w-5 h-5" />
              <span>{updateProductMutation.isLoading || isLoading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          {/* Basic Information */}
          <div 
            ref={sectionRefs.basic}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'basic' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-sm text-gray-500">Product name, description, and details</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50/50' : ''
                  }`}
                  placeholder="Enter product name"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                    errors.slug ? 'border-red-300 bg-red-50/50' : ''
                  }`}
                  placeholder="product-url-slug"
                  required
                />
                {errors.slug && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.slug}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                placeholder="Detailed product description..."
              />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Stock keeping unit"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Product brand"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div 
            ref={sectionRefs.pricing}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'pricing' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Pricing</h2>
                <p className="text-sm text-gray-500">Set product prices</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Price *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 ${
                      errors.price ? 'border-red-300 bg-red-50/50' : ''
                    }`}
                    placeholder="0.00"
                    required
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Compare at Price
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                  <input
                    type="number"
                    name="compareAtPrice"
                    value={formData.compareAtPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Cost per Item
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</div>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div 
            ref={sectionRefs.inventory}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'inventory' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Inventory</h2>
                <p className="text-sm text-gray-500">Manage stock levels</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  className={`block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 ${
                    errors.quantity ? 'border-red-300 bg-red-50/50' : ''
                  }`}
                  placeholder="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleInputChange}
                  min="0"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="trackQuantity"
                  checked={formData.trackQuantity}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Track quantity</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="allowBackorder"
                  checked={formData.allowBackorder}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Allow backorders</span>
              </label>
            </div>
          </div>

          {/* Organization */}
          <div 
            ref={sectionRefs.organization}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'organization' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Organization</h2>
                <p className="text-sm text-gray-500">Category, vendor, and tags</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 ${
                    errors.category ? 'border-red-300 bg-red-50/50' : ''
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Vendor
                </label>
                <select
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">Select a vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.storeName || vendor.owner?.name || vendor.name || 'Unknown'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Mark as featured product</span>
              </label>
            </div>

            {/* Tags */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                  className="flex-1 block px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                  placeholder="Add a tag and press Enter"
                />
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div 
            ref={sectionRefs.shipping}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'shipping' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Shipping</h2>
                <p className="text-sm text-gray-500">Weight, dimensions, and shipping options</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Shipping Cost ($)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Length (cm)
                </label>
                <input
                  type="number"
                  value={formData.dimensions.length}
                  onChange={(e) => handleDimensionChange('length', e.target.value)}
                  step="0.1"
                  min="0"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Width (cm)
                </label>
                <input
                  type="number"
                  value={formData.dimensions.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  step="0.1"
                  min="0"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                  placeholder="0.0"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={formData.dimensions.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  step="0.1"
                  min="0"
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-200"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="freeShipping"
                  checked={formData.freeShipping}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Free shipping</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="taxable"
                  checked={formData.taxable}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">Taxable</span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div 
            ref={sectionRefs.images}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'images' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Images</h2>
                <p className="text-sm text-gray-500">Product images (max 10)</p>
              </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Images</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <img
                        src={image.url}
                        alt={image.alt || `Product image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {image.isMain && (
                        <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images Preview */}
            {previewImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">New Images to Upload</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <img
                        src={preview}
                        alt={`New upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
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
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <span className="text-lg font-medium text-gray-900">
                  Drop images here or click to upload
                </span>
                <span className="text-sm text-gray-500 mt-2">
                  PNG, JPG, GIF up to 5MB each (max 10 images)
                </span>
              </label>
            </div>
          </div>

          {/* SEO */}
          <div 
            ref={sectionRefs.seo}
            className={`bg-white rounded-2xl border border-gray-200/50 shadow-xl shadow-gray-900/5 p-6 lg:p-8 transition-all duration-300 scroll-mt-32 ${
              activeSection === 'seo' ? 'ring-2 ring-blue-500/20 shadow-2xl shadow-blue-500/10' : ''
            }`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 text-white shadow-lg">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">SEO Settings</h2>
                <p className="text-sm text-gray-500">Search engine optimization</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  SEO Title
                </label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200"
                  placeholder="Page title for search engines"
                  maxLength={70}
                />
                <p className="text-xs text-gray-500">
                  {formData.seoTitle.length}/70 characters
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  SEO Description
                </label>
                <textarea
                  name="seoDescription"
                  value={formData.seoDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200 resize-none"
                  placeholder="Meta description for search engines"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500">
                  {formData.seoDescription.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  SEO Keywords
                  <span className="ml-2 text-xs font-normal text-gray-400">(Meta tags for search engines)</span>
                </label>
                <input
                  type="text"
                  name="seoKeywords"
                  value={formData.seoKeywords}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200"
                  placeholder="e.g. electronics, smartphone, wireless, bluetooth"
                />
                <p className="text-xs text-gray-500">
                  These keywords go in the HTML meta tags for search engines (Google, Bing) - they are NOT visible on the product page. Separate with commas.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 pb-12">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              disabled={updateProductMutation.isLoading || isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateProductMutation.isLoading || isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{updateProductMutation.isLoading || isLoading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdminProductEdit
