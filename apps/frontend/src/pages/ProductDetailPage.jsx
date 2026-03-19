import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Minus, 
  Plus, 
  Share2,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Send
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { productAPI, reviewAPI, cartAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import LoadingSpinner from '../components/LoadingSpinner'
import ReviewCard from '../components/ReviewCard'
import ReviewForm from '../components/ReviewForm'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')
  const [showReviewForm, setShowReviewForm] = useState(false)
  
  const { addItem } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  // Fetch product details
  const { data: product, isLoading, error } = useQuery(
    ['product', slug],
    () => productAPI.getProduct(slug),
    { staleTime: 5 * 60 * 1000 }
  )

  // Fetch product reviews
  const { data: reviewsData } = useQuery(
    ['productReviews', product?.data?._id],
    () => reviewAPI.getProductReviews(product?.data?._id),
    { enabled: !!product?.data?._id, staleTime: 2 * 60 * 1000 }
  )

  // Add to cart mutation
  const addToCartMutation = useMutation(
    cartAPI.addItem,
    {
      onSuccess: () => {
        toast.success('Product added to cart!')
        queryClient.invalidateQueries('cart')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add to cart')
      }
    }
  )

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation(
    (productId) => cartAPI.addToWishlist(productId),
    {
      onSuccess: () => {
        toast.success('Added to wishlist!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add to wishlist')
      }
    }
  )

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    const productId = product?.data?._id
    if (productId) {
      await addToCartMutation.mutateAsync({
        productId,
        quantity,
        variant: selectedVariant
      })
    }
  }

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist')
      return
    }

    const productId = product?.data?._id
    if (productId) {
      await addToWishlistMutation.mutateAsync(productId)
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    const maxQuantity = selectedVariant 
      ? selectedVariant.inventory 
      : product?.data?.inventory?.quantity || 0

    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant)
    setQuantity(1)
  }

  const calculateDiscount = () => {
    const productData = product?.data
    if (!productData?.compareAtPrice) return 0
    
    return Math.round(((productData.compareAtPrice - productData.price) / productData.compareAtPrice) * 100)
  }

  const calculateFinalPrice = () => {
    const productData = product?.data
    let basePrice = productData?.price || 0
    
    if (selectedVariant) {
      basePrice = selectedVariant.price
    }

    // Apply flash sale discount if applicable
    if (productData?.flashSale?.enabled) {
      const discount = (basePrice * productData.flashSale.discountPercentage) / 100
      return basePrice - discount
    }

    return basePrice
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error || !product?.data) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Link to="/products" className="btn-primary">
          Back to Products
        </Link>
      </div>
    )
  }

  const productData = product.data
  const reviews = reviewsData?.data?.reviews || []
  const finalPrice = calculateFinalPrice()
  const discount = calculateDiscount()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="breadcrumb mb-8">
        <Link to="/" className="breadcrumb-item">Home</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/products" className="breadcrumb-item">Products</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-item">{productData.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={productData.images[selectedImage]?.url || '/api/placeholder/600/600'}
              alt={productData.name}
              className="w-full h-full object-cover"
            />
            
            {/* Discount Badge */}
            {(discount > 0 || productData.flashSale?.enabled) && (
              <div className="absolute top-4 left-4 bg-error-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {productData.flashSale?.enabled 
                  ? `-${productData.flashSale.discountPercentage}%`
                  : `-${discount}%`
                }
              </div>
            )}

            {/* Image Navigation */}
            {productData.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === 0 ? productData.images.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedImage((prev) => (prev === productData.images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {productData.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {productData.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${productData.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video if available */}
          {productData.video && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                src={productData.video.url}
                poster={productData.video.thumbnail}
                controls
                className="w-full h-full"
              />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          {/* Product Title and Rating */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{productData.name}</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{productData.ratings.average.toFixed(1)}</span>
                <span className="text-gray-500">({productData.ratings.count} reviews)</span>
              </div>
              
              <span className="text-gray-500">|</span>
              
              <span className="text-gray-600">{productData.soldCount} sold</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-gray-900">
              ${finalPrice.toFixed(2)}
            </span>
            
            {productData.compareAtPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${productData.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Variants */}
          {productData.variants && productData.variants.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Options</h3>
              <div className="space-y-3">
                {productData.variants.map((variant) => (
                  <div key={variant.name} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{variant.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {variant.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleVariantChange({ name: variant.name, option })}
                          className={`px-4 py-2 rounded-lg border ${
                            selectedVariant?.name === variant.name && selectedVariant?.option === option
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-0 focus:outline-none"
                  min="1"
                  max={selectedVariant ? selectedVariant.inventory : productData.inventory.quantity}
                />
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <span className="text-sm text-gray-600">
                {selectedVariant ? selectedVariant.inventory : productData.inventory.quantity} available
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isLoading}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>{addToCartMutation.isLoading ? 'Adding...' : 'Add to Cart'}</span>
            </button>
            
            <button
              onClick={handleAddToWishlist}
              disabled={addToWishlistMutation.isLoading}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Heart className="w-5 h-5" />
              <span>Wishlist</span>
            </button>
            
            <button className="btn-outline">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Truck className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Free Shipping</p>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Secure Payment</p>
                <p className="text-sm text-gray-600">100% secure</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-medium text-gray-900">Easy Returns</p>
                <p className="text-sm text-gray-600">30 days return</p>
              </div>
            </div>
          </div>

          {/* Product Info Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex space-x-8">
              {['description', 'reviews', 'shipping'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="py-6">
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p>{productData.description}</p>
                  {productData.shortDescription && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Quick Summary</h4>
                      <p>{productData.shortDescription}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Customer Reviews</h3>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Write Review</span>
                      </button>
                    )}
                  </div>

                  {showReviewForm && (
                    <ReviewForm
                      productId={productData._id}
                      onSubmit={() => {
                        setShowReviewForm(false)
                        queryClient.invalidateQueries(['productReviews', productData._id])
                      }}
                    />
                  )}

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <ReviewCard key={review._id} review={review} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Information</h4>
                    <p className="text-gray-600">
                      Free shipping on orders over $50. Standard shipping takes 3-5 business days.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Return Policy</h4>
                    <p className="text-gray-600">
                      We offer a 30-day return policy for unused items in original packaging.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
