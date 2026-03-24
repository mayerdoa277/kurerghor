import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@components': path.resolve(process.cwd(), './src/components'),
      '@pages': path.resolve(process.cwd(), './src/pages'),
      '@features': path.resolve(process.cwd(), './src/features'),
      '@hooks': path.resolve(process.cwd(), './src/hooks'),
      '@services': path.resolve(process.cwd(), './src/services'),
      '@store': path.resolve(process.cwd(), './src/store'),
      '@layouts': path.resolve(process.cwd(), './src/layouts'),
      '@utils': path.resolve(process.cwd(), './src/utils')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://disciplined-victory.up.railway.app/api/v1' 
        : 'http://localhost:5000/api/v1'
    ),
    'import.meta.env.VITE_API_BASE': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://disciplined-victory.up.railway.app' 
        : 'http://localhost:5000'
    )
  }
})
