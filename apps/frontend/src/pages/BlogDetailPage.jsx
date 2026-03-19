import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Heart,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
  Bookmark
} from 'lucide-react'
import { useQuery } from 'react-query'
import { blogAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const BlogDetailPage = () => {
  const { slug } = useParams()
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Fetch blog post
  const { data: postData, isLoading } = useQuery(
    ['blogPost', slug],
    () => blogAPI.getPost(slug),
    { staleTime: 5 * 60 * 1000 }
  )

  const post = postData?.data

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

  const handleShare = (platform) => {
    const url = window.location.href
    const text = post?.title || ''
    
    let shareUrl = ''
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      default:
        return
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
    // In a real implementation, this would save to backend
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    // Show toast notification
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog post not found</h2>
        <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
        <Link to="/blog" className="btn-primary">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link 
        to="/blog" 
        className="btn-outline inline-flex items-center space-x-2 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Blog</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Article Header */}
          <article className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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

            <div className="p-6 lg:p-8">
              {/* Post Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
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
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Content */}
              <div 
                className="prose prose-lg max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Related Posts */}
          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {post.relatedPosts.map((relatedPost) => (
                  <div key={relatedPost._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    {relatedPost.featuredImage && (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <Link 
                        to={`/blog/${relatedPost.slug}`}
                        className="block group"
                      >
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(relatedPost.createdAt)}
                        </p>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Share Article */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Article</h3>
            
            <div className="space-y-3">
              {/* Social Share Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                  aria-label="Share on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  aria-label="Share on LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
              
              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                className="w-full btn-outline flex items-center justify-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy Link</span>
              </button>
            </div>
          </div>

          {/* Author Info */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About Author</h3>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                {post.author?.avatar ? (
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary-100">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">
                  {post.author?.name || 'Admin'}
                </h4>
                <p className="text-sm text-gray-600">
                  {post.author?.bio || 'Ecommerce Platform Team Member'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              {post.author?.email && (
                <p>Email: {post.author.email}</p>
              )}
              <p>Posts: {post.author?.postCount || 'Multiple'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleBookmark}
                className={`w-full btn-outline flex items-center justify-center space-x-2 ${
                  isBookmarked ? 'bg-primary-50 text-primary-700 border-primary-300' : ''
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              
              <button className="w-full btn-outline flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Comments</span>
              </button>
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-primary-600 rounded-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Subscribe to Newsletter</h3>
            <p className="text-primary-100 mb-6 text-sm">
              Get the latest blog posts and exclusive content delivered to your inbox.
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
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogDetailPage
