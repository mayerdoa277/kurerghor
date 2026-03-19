import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { productAPI } from '../services/api'

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Search products
  const { data: searchProducts, isLoading } = useQuery(
    ['searchProducts', query],
    () => productAPI.searchProducts({ query, limit: 5 }),
    {
      enabled: query.length >= 2,
      staleTime: 5 * 60 * 1000
    }
  )

  useEffect(() => {
    if (searchProducts?.data) {
      setSearchResults(searchProducts.data)
    } else {
      setSearchResults([])
    }
  }, [searchProducts])

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`)
    onClose()
    setQuery('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      onClose()
      setQuery('')
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
      setQuery('')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6">
          {/* Search Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Search Products</h2>
            <button
              onClick={() => {
                onClose()
                setQuery('')
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </form>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && query.length >= 2 && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Searching...</p>
              </div>
            )}

            {!isLoading && query.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found for "{query}"</p>
              </div>
            )}

            {!isLoading && searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Search Results</span>
                </div>
                
                {searchResults.map((product) => (
                  <div
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <img
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="font-semibold text-primary-600">${product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length < 2 && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Type at least 2 characters to search</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
