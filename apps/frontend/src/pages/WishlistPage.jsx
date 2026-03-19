import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  Star,
  Eye,
  Grid,
  List
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { userAPI, cartAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const WishlistPage = () => {
  const [viewMode, setViewMode] = useState('grid')
  const { addItem } = useCartStore()
  const queryClient = useQueryClient()

  // Fetch wishlist
  const { data: wishlistData, isLoading } = useQuery(
    'userWishlist',
    userAPI.getWishlist,
    { staleTime: 5 * 60 * 1000 }
  )

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation(
    userAPI.removeFromWishlist,
    {
      onSuccess: () => {
        toast.success('Removed from wishlist!')
        queryClient.invalidateQueries('userWishlist')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to remove from wishlist')
      }
    }
  )

  // Add to cart mutation
  const addToCartMutation = useMutation(
    cartAPI.addItem,
    {
      onSuccess: () => {
        toast.success('Added to cart!')
        queryClient.invalidateQueries('cart')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add to cart')
      }
    }
  )

  const wishlist = wishlistData?.data || []

  const handleAddToCart = async (productId) => {
    await addToCartMutation.mutateAsync({
      productId,
      quantity: 1
    })
  }

  const handleRemoveFromWishlist = async (productId) => {
    await removeFromWishlistMutation.mutateAsync(productId)
  }

  const handleRemoveFromWishlistAndAddToCart = async (productId) => {
    await removeFromWishlistMutation.mutateAsync(productId)
    await handleAddToCart(productId)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlist.length > 0 
              ? `${wishlist.length} item${wishlist.length > 1 ? 's' : ''} saved`
              : 'Your wishlist is empty'
            }
          </p>
        </div>
        
        {wishlist.length > 0 && (
          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {wishlist.length > 0 ? (
        <div className="space-y-6">
          {/* Wishlist Items */}
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {wishlist.map((item) => (
              <div key={item._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {viewMode === 'grid' ? (
                  // Grid View
                  <div className="p-4">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={item.images?.[0]?.url || '/api/placeholder/300/300'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Discount Badge */}
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <div className="absolute top-2 left-2 bg-error-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          {Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2">
                      <Link 
                        to={`/products/${item.slug}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      
                      {/* Rating */}
                      {item.ratings && item.ratings.count > 0 && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">
                            {item.ratings.average.toFixed(1)} ({item.ratings.count})
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${item.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Stock Status */}
                      <div className="text-sm text-gray-600">
                        {item.inventory?.quantity > 0 
                          ? `${item.inventory.quantity} in stock`
                          : 'Out of stock'
                        }
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleRemoveFromWishlistAndAddToCart(item._id)}
                        disabled={addToCartMutation.isLoading || item.inventory?.quantity === 0}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2 text-sm"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                      
                      <button
                        onClick={() => handleRemoveFromWishlist(item._id)}
                        disabled={removeFromWishlistMutation.isLoading}
                        className="btn-outline p-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // List View
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.images?.[0]?.url || '/api/placeholder/100/100'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link 
                              to={`/products/${item.slug}`}
                              className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                            >
                              {item.name}
                            </Link>
                            
                            {/* Rating */}
                            {item.ratings && item.ratings.count > 0 && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600">
                                  {item.ratings.average.toFixed(1)} ({item.ratings.count})
                                </span>
                              </div>
                            )}

                            {/* Stock Status */}
                            <div className="text-sm text-gray-600 mt-1">
                              {item.inventory?.quantity > 0 
                                ? `${item.inventory.quantity} in stock`
                                : 'Out of stock'
                              }
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right ml-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-gray-900">
                                ${item.price.toFixed(2)}
                              </span>
                              {item.compareAtPrice && item.compareAtPrice > item.price && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.compareAtPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            
                            {/* Discount Badge */}
                            {item.compareAtPrice && item.compareAtPrice > item.price && (
                              <div className="bg-error-100 text-error-800 px-2 py-1 rounded text-xs font-semibold">
                                {Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)}% OFF
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 mt-4">
                        <button
                          onClick={() => handleRemoveFromWishlistAndAddToCart(item._id)}
                          disabled={addToCartMutation.isLoading || item.inventory?.quantity === 0}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFromWishlist(item._id)}
                          disabled={removeFromWishlistMutation.isLoading}
                          className="btn-outline"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                // Add all items to cart
                wishlist.forEach(item => {
                  if (item.inventory?.quantity > 0) {
                    handleAddToCart(item._id)
                  }
                })
              }}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
            
            <button
              onClick={() => {
                // Clear wishlist
                if (window.confirm('Are you sure you want to clear your wishlist?')) {
                  wishlist.forEach(item => {
                    handleRemoveFromWishlist(item._id)
                  })
                }
              }}
              className="btn-outline flex items-center justify-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Wishlist</span>
            </button>
          </div>
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start adding items to your wishlist to keep track of products you love.
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      )}
    </div>
  )
}

export default WishlistPage
