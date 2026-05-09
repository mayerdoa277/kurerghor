// Currency configuration
// Uses environment variables with fallbacks for Bangladesh Taka

export const CURRENCY = import.meta.env.VITE_CURRENCY || 'BDT'
export const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || '৳'
export const CURRENCY_NAME = import.meta.env.VITE_CURRENCY_NAME || 'Taka'

// Helper function to format price with currency symbol
export const formatPrice = (price) => {
  if (typeof price !== 'number' && typeof price !== 'string') {
    return `${CURRENCY_SYMBOL}0.00`
  }
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  return `${CURRENCY_SYMBOL}${numPrice.toFixed(2)}`
}

// Helper to get just the currency code for meta tags
export const getCurrencyCode = () => CURRENCY

// Helper to get currency symbol
export const getCurrencySymbol = () => CURRENCY_SYMBOL
