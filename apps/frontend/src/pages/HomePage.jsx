import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Clock, 
  TrendingUp,
  Sparkles,
  ShoppingBag
} from 'lucide-react'
import { useQuery } from 'react-query'
import { productAPI, categoryAPI } from '../services/api'
import { 
  isDemoMode, 
  getDemoFeaturedProducts, 
  getDemoFlashSaleProducts, 
  getDemoCategories,
  getDemoProducts,
  demoHeroSlides,
  demoReviews
} from '../demo/services/index.js'
import HeroSlider from '../components/HeroSlider'
import ProductCard from '../components/ProductCard'
import CategoryPill from '../components/CategoryPill'
import FlashSaleTimer from '../components/FlashSaleTimer'
import ReviewCard from '../components/ReviewCard'
import LoadingSpinner from '../components/LoadingSpinner'

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState(null)
  const demoMode = isDemoMode()

  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery(
    'featuredProducts',
    () => demoMode ? getDemoFeaturedProducts({ limit: 8 }) : productAPI.getFeaturedProducts({ limit: 8 }),
    { 
      staleTime: 5 * 60 * 1000,
      enabled: true
    }
  )

  // Fetch flash sale products
  const { data: flashSaleProducts, isLoading: flashLoading } = useQuery(
    'flashSaleProducts',
    () => demoMode ? getDemoFlashSaleProducts({ limit: 4 }) : productAPI.getFlashSaleProducts({ limit: 4 }),
    { 
      staleTime: 60 * 1000,
      enabled: true
    }
  )

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'categories',
    () => demoMode ? getDemoCategories() : categoryAPI.getCategories(),
    { 
      staleTime: 30 * 60 * 1000,
      enabled: true
    }
  )

  // Fetch top rated products
  const { data: topRatedProducts, isLoading: topRatedLoading } = useQuery(
    'topRatedProducts',
    () => demoMode ? getDemoProducts({ sortBy: 'rating', limit: 8 }) : productAPI.getProducts({ sortBy: 'rating', limit: 8 }),
    { 
      staleTime: 5 * 60 * 1000,
      enabled: true
    }
  )

  // Use demo hero slides or fallback
  const heroSlides = demoHeroSlides

  // Use demo reviews
  const reviews = demoReviews

  // Calculate flash sale time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const endTime = new Date()
      endTime.setHours(23, 59, 59, 999) // End of today
      
      const difference = endTime - now
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)
        
        setFlashSaleTimeLeft({ hours, minutes, seconds })
      } else {
        setFlashSaleTimeLeft(null)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  if (featuredLoading || flashLoading || categoriesLoading || topRatedLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative">
        <HeroSlider 
          slides={heroSlides}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />
      </section>

      {/* Flash Sale Section */}
      {flashSaleTimeLeft && flashSaleProducts?.data?.products?.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-error-500 to-warning-500 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Flash Sale</h2>
              </div>
              <FlashSaleTimer timeLeft={flashSaleTimeLeft} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSaleProducts.data.products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  showFlashSale={true}
                />
              ))}
            </div>
            
            <div className="text-center mt-6">
              <Link 
                to="/products?flashSale=true" 
                className="inline-flex items-center space-x-2 bg-white text-error-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>View All Flash Deals</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-600">Find what you're looking for</p>
        </div>
        
        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
          {Array.isArray(categories?.data) ? categories.data.map((category) => (
            <CategoryPill 
              key={category._id}
              category={category}
            />
          )) : null}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Handpicked by our team</p>
          </div>
          <Link 
            to="/products?featured=true" 
            className="btn-outline"
          >
            See All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts?.data?.products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Top Rated Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Top Rated</h2>
            <p className="text-gray-600">Highly rated by customers</p>
          </div>
          <Link 
            to="/products?sortBy=rating" 
            className="btn-outline"
          >
            See All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topRatedProducts?.data?.products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Customer Reviews</h2>
            <p className="text-gray-600">What our customers are saying</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/reviews" 
              className="btn-outline"
            >
              Read More Reviews
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Our Latest Deals
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special offers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button className="btn bg-white text-primary-600 hover:bg-gray-100">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
