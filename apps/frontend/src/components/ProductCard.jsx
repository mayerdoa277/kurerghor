import { Link } from 'react-router-dom'
import { Heart, Star, ShoppingCart } from 'lucide-react'

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const calculateDiscount = () => {
    if (!product.compareAtPrice || product.compareAtPrice <= product.price) return 0
    return Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
  }

  const discount = calculateDiscount()

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow p-4">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={product.images?.[0]?.url || '/api/placeholder/100/100'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <Link 
              to={`/products/${product.slug}`}
              className="block group"
            >
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                {product.name}
              </h3>
            </Link>
            
            {product.ratings && product.ratings.count > 0 && (
              <div className="flex items-center space-x-1 mb-2">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">
                  {product.ratings.average.toFixed(1)} ({product.ratings.count})
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <button className="btn-outline p-2">
              <Heart className="w-4 h-4" />
            </button>
            <button className="btn-primary p-2">
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col h-full">
      {/* Product Image - Fixed Aspect Ratio */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0]?.url || '/api/placeholder/300/300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-error-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discount}%
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
            <Heart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info - Flexible Height */}
      <div className="p-4 flex flex-col flex-1">
        {/* Product Name */}
        <Link 
          to={`/products/${product.slug}`}
          className="block group"
        >
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2 flex-grow">
            {product.name}
          </h3>
        </Link>
        
        {/* Rating */}
        {product.ratings && product.ratings.count > 0 && (
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">
              {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart - Always at bottom */}
        <button className="w-full btn-primary flex items-center justify-center space-x-2 mt-auto">
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  )
}

export default ProductCard
