import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowRight, 
  Search,
  Filter,
  ChevronDown
} from 'lucide-react'
import { useQuery } from 'react-query'
import { blogAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import Pagination from '../components/Pagination'

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch blog posts
  const { data: blogData, isLoading } = useQuery(
    ['blogPosts', currentPage, categoryFilter],
    () => {
      const params = { page: currentPage }
      if (categoryFilter) params.category = categoryFilter
      return blogAPI.getPosts(params)
    },
    { staleTime: 5 * 60 * 1000 }
  )

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'blogCategories',
    () => blogAPI.getCategories(),
    { staleTime: 30 * 60 * 1000 }
  )

  // Fetch popular posts
  const { data: popularData } = useQuery(
    'popularBlogPosts',
    () => blogAPI.getPopularPosts({ limit: 5 }),
    { staleTime: 10 * 60 * 1000 }
  )

  const posts = blogData?.data?.posts || []
  const pagination = blogData?.data?.pagination
  const categories = categoriesData?.data || []
  const popularPosts = popularData?.data || []

  const handleSearch = (e) => {
    e.preventDefault()
    // In a real implementation, this would trigger a search
    console.log('Searching for:', searchQuery)
  }

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category === categoryFilter ? '' : category)
    setCurrentPage(1)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const readTime = (content) => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Blog</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Tips, trends, and insights from our team and community
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blog posts..."
              className="search-input w-full"
            />
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategoryFilter('')}
                className={`category-pill whitespace-nowrap ${!categoryFilter ? 'border-primary-500 bg-primary-50' : ''}`}
              >
                All Posts
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryFilter(category.name)}
                  className={`category-pill whitespace-nowrap ${categoryFilter === category.name ? 'border-primary-500 bg-primary-50' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts */}
          {posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <article key={post._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Featured Image */}
                  {post.featuredImage && (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    {/* Post Meta */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{readTime(post.content)} min read</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author?.name || 'Admin'}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="block group"
                    >
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {categoryFilter ? `No posts in ${categoryFilter}` : 'No blog posts found'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {categoryFilter 
                    ? 'Try selecting a different category or check back later.'
                    : 'Check back later for new content.'
                  }
                </p>
                <Link to="/blog" className="btn-primary">
                  View All Posts
                </Link>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-12">
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Popular Posts */}
          {popularPosts.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Posts</h3>
              
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <div key={post._id} className="flex space-x-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100">
                          <span className="text-primary-600 font-bold text-sm">
                            {post.title.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="block group"
                      >
                        <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-1">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {formatDate(post.createdAt)}
                        </p>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {categories.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category._id}
                    onClick={() => handleCategoryFilter(category.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                      categoryFilter === category.name
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">
                        {category.count} posts
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter Signup */}
          <div className="bg-primary-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-primary-100 mb-6">
              Get the latest blog posts delivered straight to your inbox.
            </p>
            
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
              <button
                type="submit"
                className="w-full bg-white text-primary-600 font-medium py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Tags</h3>
            
            <div className="flex flex-wrap gap-2">
              {['Ecommerce', 'Tips', 'Tutorials', 'News', 'Guides', 'Products', 'Reviews', 'Technology'].map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogPage
