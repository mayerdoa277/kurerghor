import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('Error parsing auth token:', error)
      }
    }

    // Add session ID for guest cart
    const sessionId = localStorage.getItem('guest-session-id')
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
          const authData = JSON.parse(authStorage)
          const refreshToken = authData.state?.refreshToken

          if (refreshToken) {
            const response = await axios.post(
              `${api.defaults.baseURL}/auth/refresh`,
              { refreshToken }
            )

            const { accessToken } = response.data.data

            // Update stored token
            authData.state.token = accessToken
            localStorage.setItem('auth-storage', JSON.stringify(authData))

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('auth-storage')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error)
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true
      })
    }

    return Promise.reject(error)
  }
)

// API service methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me')
}

export const userAPI = {
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/password', passwordData),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`)
}

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: (params) => api.get('/products/featured/list', { params }),
  getFlashSaleProducts: (params) => api.get('/products/flash-sale/list', { params }),
  getVendorProducts: (vendorId, params) => api.get(`/products/vendor/${vendorId}`, { params }),
  searchProducts: (params) => api.get('/search/products', { params })
}

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (slug) => api.get(`/categories/${slug}`),
  getCategoryTree: () => api.get('/categories/tree/all')
}

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (itemData) => api.post('/cart/add', itemData),
  updateItem: (itemData) => api.put('/cart/update', itemData),
  removeItem: (itemData) => api.delete('/cart/remove', { data: itemData }),
  clearCart: () => api.delete('/cart/clear'),
  mergeGuestCart: (guestSessionId) => api.post('/cart/merge', { guestSessionId })
}

export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  requestRefund: (id, reason) => api.put(`/orders/${id}/refund`, { reason })
}

export const paymentAPI = {
  initiatePayment: (paymentData) => api.post('/payments/initiate', paymentData),
  getPaymentStatus: (orderId) => api.get(`/payments/status/${orderId}`),
  verifyPayment: (verificationData) => api.post('/payments/verify', verificationData)
}

export const vendorAPI = {
  requestVendorAccount: (requestData) => api.post('/vendors/request', requestData),
  getDashboard: () => api.get('/vendors/dashboard'),
  getProducts: (params) => api.get('/vendors/products', { params }),
  getOrders: (params) => api.get('/vendors/orders', { params }),
  getEarnings: (params) => api.get('/vendors/earnings', { params }),
  updateProfile: (profileData) => api.put('/vendors/profile', profileData)
}

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (userId, statusData) => api.put(`/admin/users/${userId}/status`, statusData),
  getProducts: (params) => api.get('/admin/products', { params }),
  updateProductStatus: (productId, statusData) => api.put(`/admin/products/${productId}/status`, statusData),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (categoryData) => api.post('/admin/categories', categoryData),
  getCoupons: (params) => api.get('/admin/coupons', { params }),
  createCoupon: (couponData) => api.post('/admin/coupons', couponData),
  getAnalytics: (params) => api.get('/admin/analytics', { params })
}

export const searchAPI = {
  searchProducts: (params) => api.get('/search/products', { params }),
  getSuggestions: (params) => api.get('/search/suggestions', { params }),
  getPopular: () => api.get('/search/popular'),
  advancedSearch: (searchData) => api.post('/search/advanced', searchData)
}

export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  createReview: (reviewData) => api.post('/reviews', reviewData),
  updateReview: (reviewId, reviewData) => api.put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
  getUserReviews: (params) => api.get('/reviews/user', { params })
}

export const couponAPI = {
  getCoupons: () => api.get('/coupons'),
  validateCoupon: (couponData) => api.post('/coupons/validate', couponData),
  getCoupon: (code) => api.get(`/coupons/${code}`)
}

export const blogAPI = {
  getPosts: (params) => api.get('/blog', { params }),
  getPost: (slug) => api.get(`/blog/${slug}`),
  getCategories: () => api.get('/blog/categories/all'),
  getPopularPosts: (params) => api.get('/blog/popular/list', { params })
}

export default api
