import { demoCategories } from './categories.js'

export const demoProducts = [
  {
    _id: 'prod1',
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.',
    price: 199.99,
    salePrice: 149.99,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop'
    ],
    category: demoCategories[0],
    categoryId: 'cat1',
    vendor: {
      _id: 'vendor1',
      name: 'TechStore Pro',
      email: 'vendor@techstore.com'
    },
    rating: 4.5,
    numReviews: 234,
    stock: 45,
    featured: true,
    flashSale: true,
    tags: ['wireless', 'bluetooth', 'headphones', 'audio'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-03-10T15:30:00Z'
  },
  {
    _id: 'prod2',
    name: 'Smart Watch Pro',
    slug: 'smart-watch-pro',
    description: 'Advanced fitness tracking, heart rate monitoring, and smartphone integration in a sleek design.',
    price: 349.99,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=600&h=600&fit=crop'
    ],
    category: demoCategories[0],
    categoryId: 'cat1',
    vendor: {
      _id: 'vendor2',
      name: 'Gadget World',
      email: 'vendor@gadgetworld.com'
    },
    rating: 4.8,
    numReviews: 567,
    stock: 23,
    featured: true,
    flashSale: false,
    tags: ['smartwatch', 'fitness', 'wearable', 'health'],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-03-12T11:20:00Z'
  },
  {
    _id: 'prod3',
    name: 'Designer Leather Jacket',
    slug: 'designer-leather-jacket',
    description: 'Genuine leather jacket with modern cut and premium craftsmanship. Perfect for any occasion.',
    price: 599.99,
    salePrice: 449.99,
    images: [
      'https://images.unsplash.com/photo-1551698628-1dfe5d97d256?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=600&fit=crop'
    ],
    category: demoCategories[1],
    categoryId: 'cat2',
    vendor: {
      _id: 'vendor3',
      name: 'Fashion Boutique',
      email: 'vendor@fashionboutique.com'
    },
    rating: 4.7,
    numReviews: 189,
    stock: 12,
    featured: true,
    flashSale: true,
    tags: ['leather', 'jacket', 'fashion', 'designer'],
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-03-08T16:45:00Z'
  },
  {
    _id: 'prod4',
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description: 'Extra thick, non-slip yoga mat with alignment markers. Eco-friendly materials.',
    price: 79.99,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop'
    ],
    category: demoCategories[3],
    categoryId: 'cat4',
    vendor: {
      _id: 'vendor4',
      name: 'Sports Gear Plus',
      email: 'vendor@sportsgear.com'
    },
    rating: 4.6,
    numReviews: 423,
    stock: 89,
    featured: false,
    flashSale: false,
    tags: ['yoga', 'fitness', 'exercise', 'wellness'],
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-03-05T09:15:00Z'
  },
  {
    _id: 'prod5',
    name: 'Coffee Maker Deluxe',
    slug: 'coffee-maker-deluxe',
    description: 'Programmable coffee maker with thermal carafe, built-in grinder, and multiple brew settings.',
    price: 249.99,
    salePrice: 199.99,
    images: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511920183353-3c9c1f6a5c6c?w=600&h=600&fit=crop'
    ],
    category: demoCategories[2],
    categoryId: 'cat3',
    vendor: {
      _id: 'vendor5',
      name: 'Home Essentials',
      email: 'vendor@homeessentials.com'
    },
    rating: 4.4,
    numReviews: 156,
    stock: 34,
    featured: true,
    flashSale: true,
    tags: ['coffee', 'kitchen', 'appliance', 'brewer'],
    createdAt: '2024-01-25T16:00:00Z',
    updatedAt: '2024-03-11T13:30:00Z'
  },
  {
    _id: 'prod6',
    name: 'Bestseller Novel Collection',
    slug: 'bestseller-novel-collection',
    description: 'Collection of 5 award-winning novels from various genres. Perfect for book lovers.',
    price: 89.99,
    salePrice: 69.99,
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop'
    ],
    category: demoCategories[4],
    categoryId: 'cat5',
    vendor: {
      _id: 'vendor6',
      name: 'Bookworm Central',
      email: 'vendor@bookworm.com'
    },
    rating: 4.9,
    numReviews: 892,
    stock: 156,
    featured: false,
    flashSale: false,
    tags: ['books', 'novels', 'literature', 'bestseller'],
    createdAt: '2024-02-05T10:30:00Z',
    updatedAt: '2024-03-09T14:20:00Z'
  },
  {
    _id: 'prod7',
    name: 'Gaming Console Bundle',
    slug: 'gaming-console-bundle',
    description: 'Latest gaming console with two controllers, headset, and three popular games.',
    price: 599.99,
    salePrice: null,
    images: [
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=600&fit=crop'
    ],
    category: demoCategories[5],
    categoryId: 'cat6',
    vendor: {
      _id: 'vendor7',
      name: 'GameZone Store',
      email: 'vendor@gamezone.com'
    },
    rating: 4.8,
    numReviews: 445,
    stock: 18,
    featured: true,
    flashSale: false,
    tags: ['gaming', 'console', 'video games', 'entertainment'],
    createdAt: '2024-02-15T12:00:00Z',
    updatedAt: '2024-03-10T10:45:00Z'
  },
  {
    _id: 'prod8',
    name: 'Organic Skincare Set',
    slug: 'organic-skincare-set',
    description: 'Complete skincare routine with organic ingredients. Includes cleanser, toner, serum, and moisturizer.',
    price: 129.99,
    salePrice: 99.99,
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd23ed8f4ea?w=600&h=600&fit=crop',
      'https://images.unsplash.com/photo-1556228723-5a2b5c3e9b0c?w=600&h=600&fit=crop'
    ],
    category: demoCategories[1],
    categoryId: 'cat2',
    vendor: {
      _id: 'vendor8',
      name: 'Beauty Natural',
      email: 'vendor@beautynatural.com'
    },
    rating: 4.6,
    numReviews: 278,
    stock: 67,
    featured: false,
    flashSale: true,
    tags: ['skincare', 'organic', 'beauty', 'cosmetics'],
    createdAt: '2024-01-30T15:00:00Z',
    updatedAt: '2024-03-07T12:10:00Z'
  }
]
