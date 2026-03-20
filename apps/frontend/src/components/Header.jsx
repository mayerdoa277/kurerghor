import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'
import SearchModal from './SearchModal'
import UserDropdown from './UserDropdown'
import MobileMenu from './MobileMenu'

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { itemCount, openCart } = useCartStore()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsSearchOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200' 
            : 'bg-white/80 backdrop-blur-sm border-b border-gray-100'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className={`flex items-center justify-between h-16 relative transition-all duration-300 ${
            isMobileMenuOpen ? 'space-x-0' : 'space-x-4'
          }`}>
            {/* Logo - Fixed Size */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center space-x-1 sm:space-x-2 text-lg sm:text-xl lg:text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">E</span>
                </div>
                <span className="hidden sm:block">Ecommerce</span>
              </Link>
            </div>

            {/* Search Bar - Dynamic Positioning */}
            <div className={`transition-all duration-300 ${
              isMobileMenuOpen 
                ? 'absolute left-1/2 transform -translate-x-1/2 w-32 sm:w-48 md:w-64 lg:w-80 xl:w-96 z-10' 
                : 'flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-4'
            }`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className={`w-full transition-all duration-300 ${
                    isMobileMenuOpen 
                      ? 'px-2 py-1 sm:px-3 sm:py-2 pl-6 sm:pl-10 pr-2 sm:pr-4 text-xs sm:text-sm'
                      : 'px-3 py-2 pl-10 pr-4 text-sm'
                  } text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white`}
                  onClick={() => setIsSearchOpen(true)}
                />
                <Search className={`absolute text-gray-400 transition-all duration-300 ${
                  isMobileMenuOpen 
                    ? 'left-1.5 sm:left-3 top-1.5 sm:top-2.5 w-3 h-3 sm:w-4 sm:h-4'
                    : 'left-3 top-2.5 w-4 h-4'
                }`} />
              </div>
            </div>

            {/* Right Side Actions - Fixed Width */}
            <div className={`flex items-center justify-end space-x-1 sm:space-x-3 flex-shrink-0 transition-all duration-300 ${
              isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-3 lg:space-x-6 mr-2 lg:mr-4">
                <Link 
                  to="/" 
                  className={`text-xs sm:text-sm nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
                >
                  Home
                </Link>
                <Link 
                  to="/products" 
                  className={`text-xs sm:text-sm nav-link ${location.pathname.startsWith('/products') ? 'nav-link-active' : ''}`}
                >
                  Products
                </Link>
                <Link 
                  to="/blog" 
                  className={`text-xs sm:text-sm nav-link ${location.pathname.startsWith('/blog') ? 'nav-link-active' : ''}`}
                >
                  Blog
                </Link>
              </nav>

              {/* Cart - Responsive Size */}
              <button
                onClick={openCart}
                className="relative p-1 sm:p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-primary-600 text-white text-xs rounded-full w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* User Account - Responsive Size */}
              {isAuthenticated ? (
                <UserDropdown user={user} onLogout={handleLogout} />
              ) : (
                <div className="hidden lg:flex items-center space-x-1 sm:space-x-2">
                  <Link
                    to="/login"
                    className="btn-ghost text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-1"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button - Responsive Size */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1 sm:p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-16" />

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />
    </>
  )
}

export default Header
