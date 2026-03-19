// Demo data service for testing frontend without backend
import { demoCategories, demoProducts, demoReviews, demoHeroSlides } from '../data/index.js'
import { isDemoMode } from '../utils/index.js'

// Re-export all demo data
export { demoCategories, demoProducts, demoReviews, demoHeroSlides }

// Helper functions to get filtered demo data
export const getDemoFeaturedProducts = (limit = 8) => {
  return {
    data: {
      products: demoProducts.filter(p => p.featured).slice(0, limit)
    }
  }
}

export const getDemoFlashSaleProducts = (limit = 4) => {
  return {
    data: {
      products: demoProducts.filter(p => p.flashSale).slice(0, limit)
    }
  }
}

export const getDemoProducts = (params = {}) => {
  let filtered = [...demoProducts]
  
  // Apply filters
  if (params.category) {
    filtered = filtered.filter(p => p.categoryId === params.category)
  }
  
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }
  
  if (params.minPrice) {
    filtered = filtered.filter(p => (p.salePrice || p.price) >= parseFloat(params.minPrice))
  }
  
  if (params.maxPrice) {
    filtered = filtered.filter(p => (p.salePrice || p.price) <= parseFloat(params.maxPrice))
  }
  
  if (params.rating) {
    filtered = filtered.filter(p => p.rating >= parseFloat(params.rating))
  }
  
  if (params.featured) {
    filtered = filtered.filter(p => p.featured)
  }
  
  if (params.flashSale) {
    filtered = filtered.filter(p => p.flashSale)
  }
  
  // Apply sorting
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case 'price-high':
        filtered.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      default:
        // relevance - keep original order
        break
    }
  }
  
  // Pagination
  const page = parseInt(params.page) || 1
  const limit = parseInt(params.limit) || 12
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  
  const paginatedProducts = filtered.slice(startIndex, endIndex)
  
  return {
    data: {
      products: paginatedProducts,
      pagination: {
        page: page,
        pages: Math.ceil(filtered.length / limit),
        total: filtered.length,
        limit: limit
      }
    }
  }
}

export const getDemoCategories = () => {
  return {
    data: demoCategories
  }
}

export const getDemoProduct = (id) => {
  const product = demoProducts.find(p => p._id === id || p.slug === id)
  if (!product) {
    throw new Error('Product not found')
  }
  
  const reviews = demoReviews.filter(r => r.product === product._id)
  
  return {
    data: {
      product,
      reviews
    }
  }
}

// Re-export utility functions
export { isDemoMode, setDemoMode, enableDemoMode, disableDemoMode, toggleDemoMode, autoEnableDemoMode, getDemoModeStatus } from '../utils/index.js'
