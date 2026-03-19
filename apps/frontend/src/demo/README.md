# Demo Mode Guide

This frontend includes a comprehensive demo mode that allows you to test and preview the application without requiring a backend connection.

## What Demo Mode Provides

### 📦 Demo Categories
- Electronics (156 products)
- Fashion (289 products)  
- Home & Garden (198 products)
- Sports & Outdoors (127 products)
- Books & Media (342 products)
- Toys & Games (89 products)

### 🛍️ Demo Products
- 8 sample products with realistic data
- Product images from Unsplash
- Various price points and categories
- Featured and flash sale items
- Ratings and reviews

### 📝 Demo Reviews
- Customer reviews with ratings
- User avatars and profiles
- Helpful vote counts

### 🎯 Demo Features
- Hero slider with promotional banners
- Flash sale countdown timer
- Category browsing
- Product filtering and sorting
- Search functionality
- Pagination

## How to Use Demo Mode

### Method 1: UI Toggle (Recommended)
1. Start the frontend application
2. Look for the **Settings gear icon** in the bottom-right corner
3. Click it to open the demo mode panel
4. Toggle "Use Demo Data" on/off
5. The page will automatically reload to apply changes

### Method 2: Browser Console
```javascript
// Enable demo mode
localStorage.setItem('demo-mode', 'true')
location.reload()

// Disable demo mode  
localStorage.removeItem('demo-mode')
location.reload()
```

### Method 3: Programmatic
```javascript
import { enableDemoMode, disableDemoMode, toggleDemoMode } from './demo/utils/index.js'

// Enable demo mode
enableDemoMode()

// Disable demo mode
disableDemoMode()

// Toggle current state
toggleDemoMode()
```

## How to Enable Real API
When demo mode is OFF, the app will:

Use real API calls to http://localhost:5000/api/v1
Require backend server running
Show real loading states
Use live database data
## Quick Switch Commands
Disable Demo (Enable Real API):

```javascript
localStorage.removeItem('demo-mode')
location.reload()
```

### Enable Demo:

```javascript
localStorage.setItem('demo-mode', 'true')
location.reload()
```

## Check Current Status:
```javascript
console.log(localStorage.getItem('demo-mode') === 'true')
```

## Demo Mode Behavior

### When Demo Mode is ON:
- ✅ All API calls use mock data
- ✅ No network requests to backend
- ✅ Instant loading times
- ✅ Full functionality for testing
- ✅ Works offline
- ✅ Perfect for UI development

### When Demo Mode is OFF:
- 🔄 Real API calls to backend
- 🌐 Requires backend connection
- ⚡ Real loading states
- 📊 Live data from database
- 🔐 Real authentication

## Auto-Enable in Development

Demo mode is automatically enabled in development environments unless explicitly disabled. This ensures:
- Smooth development experience
- No dependency on backend during initial development
- Easy testing of UI components

To disable auto-enable:
```javascript
// In main.jsx, comment out or remove:
// autoEnableDemoMode()
```

## Demo Data Structure

### Products
```javascript
{
  _id: 'prod1',
  name: 'Wireless Bluetooth Headphones',
  slug: 'wireless-bluetooth-headphones',
  description: 'Premium noise-cancelling...',
  price: 199.99,
  salePrice: 149.99,
  images: ['url1', 'url2'],
  category: { _id, name, slug },
  vendor: { _id, name, email },
  rating: 4.5,
  numReviews: 234,
  stock: 45,
  featured: true,
  flashSale: true,
  tags: ['wireless', 'bluetooth'],
  createdAt: '2024-01-15T10:00:00Z'
}
```

### Categories
```javascript
{
  _id: 'cat1',
  name: 'Electronics',
  slug: 'electronics',
  description: 'Latest gadgets...',
  image: 'category-image-url',
  productCount: 156
}
```

## Testing Scenarios

Demo mode is perfect for testing:

1. **UI Components**: All components work with realistic data
2. **User Flows**: Complete shopping experience from browsing to checkout
3. **Responsive Design**: Test on different screen sizes
4. **Performance**: No network latency
5. **Offline Development**: Work without internet connection
6. **Presentations**: Show app to stakeholders

## Switching Between Modes

When switching between demo and live mode:
- The app automatically reloads to apply changes
- All current state is reset
- URL parameters are preserved
- Cart and auth state will use appropriate data source

## Adding Custom Demo Data

To add more demo data:

1. Edit files in `src/demo/data/`:
   - `categories.js` for new categories
   - `products.js` for new products  
   - `reviews.js` for new reviews
   - `heroSlides.js` for new slides
2. Update helper functions if needed
3. The changes will be available immediately in demo mode

## Production Considerations

- Demo mode is disabled by default in production
- Demo mode toggle is hidden in production builds
- All demo data is client-side only
- No performance impact in live mode

---

**Tip**: Use demo mode for rapid development and testing, then switch to live mode to integrate with your real backend!
