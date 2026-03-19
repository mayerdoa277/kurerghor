import { Link } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-gray-300">404</div>
          <div className="text-2xl font-semibold text-gray-900 mt-4">
            Page not found
          </div>
        </div>

        {/* Error Message */}
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The page might have been removed, 
          had its name changed, or is temporarily unavailable.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-outline inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          
          <Link
            to="/search"
            className="btn-outline inline-flex items-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            You might be looking for:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <Link
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              All Products
            </Link>
            <Link
              to="/categories"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Categories
            </Link>
            <Link
              to="/deals"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Special Deals
            </Link>
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
