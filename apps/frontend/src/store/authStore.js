import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      vendorRequestStatus: null,

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/login', credentials)
          const { user, accessToken, refreshToken } = response.data.data

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.error || 'Login failed'
          }
        }
      },

      register: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await api.post('/auth/register', userData)
          const { user, accessToken, refreshToken } = response.data.data

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          // Set default auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.error || 'Registration failed'
          }
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get()
          if (refreshToken) {
            await api.post('/auth/logout', { refreshToken })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear auth state
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false
          })

          // Remove auth header
          delete api.defaults.headers.common['Authorization']
        }
      },

      refreshToken: async () => {
        try {
          const { refreshToken } = get()
          if (!refreshToken) {
            throw new Error('No refresh token available')
          }

          const response = await api.post('/auth/refresh', { refreshToken })
          const { accessToken } = response.data.data

          set({ token: accessToken })

          // Update auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`

          return accessToken
        } catch (error) {
          // Refresh failed, logout user
          get().logout()
          throw error
        }
      },

      updateProfile: async (userData) => {
        try {
          set({ isLoading: true })
          const response = await api.put('/users/profile', userData)
          const { user } = response.data.data

          set({
            user,
            isLoading: false
          })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.error || 'Profile update failed'
          }
        }
      },

      changePassword: async (passwordData) => {
        try {
          set({ isLoading: true })
          await api.put('/users/password', passwordData)
          set({ isLoading: false })

          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          return {
            success: false,
            error: error.response?.data?.error || 'Password change failed'
          }
        }
      },

      initializeAuth: () => {
        const { token, refreshToken, user } = get()
        
        if (token && refreshToken && user) {
          set({
            isAuthenticated: true
          })
          
          // Set auth header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      },

      setAuth: (authData) => {
        const { user, token, refreshToken } = authData
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true
        })

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      // Google OAuth
      googleLogin: (token, refreshToken) => {
        // This would be called after Google OAuth callback
        // For now, we'll implement a basic version
        set({
          token,
          refreshToken,
          isAuthenticated: true
        })

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      },

      // Vendor request status management
      fetchVendorRequestStatus: async () => {
        try {
          const response = await api.get('/users/vendor-request-status')
          set({ vendorRequestStatus: response.data.data })
          return response.data.data
        } catch (error) {
          console.error('Error fetching vendor request status:', error)
          return null
        }
      },

      clearVendorRequestStatus: () => {
        set({ vendorRequestStatus: null })
      },

      // Update user data (called after vendor role change)
      updateUserRole: (newRole) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, role: newRole }
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export { useAuthStore }
