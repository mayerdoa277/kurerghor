import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  ArrowRight,
  Heart,
  RefreshCw
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { cartAPI, productAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import LoadingSpinner from '../components/LoadingSpinner'
import CouponForm from '../components/CouponForm'
import toast from 'react-hot-toast'

const CartPage = () => {
  const navigate = useNavigate()
  const { clearCart } = useCartStore()
  const queryClient = useQueryClient()
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [discount, setDiscount] = useState(0)

  // Fetch cart
  const { data: cartData, isLoading, refetch } = useQuery(
    'cart',
    cartAPI.getCart,
    { staleTime: 30 * 1000 }
  )

  // Update item quantity mutation
  const updateQuantityMutation = useMutation(
    ({ productId, quantity, variant }) => 
      cartAPI.updateItem(productId, quantity, variant),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('Cart updated')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update cart')
      }
    }
  )

  // Remove item mutation
  const removeItemMutation = useMutation(
    ({ productId, variant }) => 
      cartAPI.removeItem(productId, variant),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('Item removed from cart')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to remove item')
      }
    }
  )

  // Clear cart mutation
  const clearCartMutation = useMutation(
    cartAPI.clearCart,
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('Cart cleared')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to clear cart')
      }
    }
  )

  // Apply coupon mutation
  const applyCouponMutation = useMutation(
    cartAPI.validateCoupon,
    {
      onSuccess: (data) => {
        setAppliedCoupon(data.data.coupon)
        setDiscount(data.data.discount)
        toast.success('Coupon applied successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Invalid coupon')
      }
    }
  )

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return
    
    updateQuantityMutation.mutate({
      productId: item.product._id,
      quantity: newQuantity,
      variant: item.variant
    })
  }

  const handleRemoveItem = (item) => {
    removeItemMutation.mutate({
      productId: item.product._id,
      variant: item.variant
    })
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCartMutation.mutate()
    }
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    applyCouponMutation.mutate({
      code: couponCode,
      subtotal: cartData?.data?.subtotal || 0
    })
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode('')
    toast.success('Coupon removed')
  }

  const calculateTax = () => {
    const subtotal = cartData?.data?.subtotal || 0
    return subtotal * 0.15 // 15% tax
  }

  const calculateShipping = () => {
    const subtotal = cartData?.data?.subtotal || 0
    return subtotal >= 50 ? 0 : 10 // Free shipping over $50
  }

  const calculateTotal = () => {
    const subtotal = cartData?.data?.subtotal || 0
    const tax = calculateTax()
    const shipping = calculateShipping()
    return subtotal + tax + shipping - discount
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  const cartItems = cartData?.data?.items || []
  const isEmpty = cartItems.length === 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">
          {isEmpty ? 'Your cart is empty' : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
        </p>
      </div>

      {isEmpty ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Clear Cart Button */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                disabled={clearCartMutation.isLoading}
                className="btn-outline flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cart</span>
              </button>
            </div>

            {/* Cart Items List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {cartItems.map((item) => (
                <div key={`${item.product._id}-${JSON.stringify(item.variant)}`} className="p-6 border-b border-gray-200 last:border-b-0">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]?.url || '/api/placeholder/100/100'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <Link 
                          to={`/products/${item.product.slug}`}
                          className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        
                        {/* Variant Info */}
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            {item.variant.name}: {item.variant.option}
                          </p>
                        )}
                        
                        {/* Price */}
                        <p className="text-lg font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="p-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          
                          <button
                            onClick={() => handleRemoveItem(item)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="text-center">
              <Link 
                to="/products" 
                className="btn-outline inline-flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Coupon Form */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Have a coupon?</h3>
              
              {!appliedCoupon ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full input"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={applyCouponMutation.isLoading}
                    className="w-full btn-outline"
                  >
                    {applyCouponMutation.isLoading ? 'Applying...' : 'Apply Coupon'}
                  </button>
                </div>
              ) : (
                <div className="bg-success-50 border border-success-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-success-800">{appliedCoupon.code}</p>
                      <p className="text-sm text-success-600">
                        {appliedCoupon.type === 'percentage' 
                          ? `${appliedCoupon.value}% off`
                          : `$${appliedCoupon.value} off`
                        }
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-success-600 hover:text-success-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${(cartData?.data?.subtotal || 0).toFixed(2)}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-success-600">
                    <span>Discount</span>
                    <span className="font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${calculateTax().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {calculateShipping() === 0 ? 'Free' : `$${calculateShipping().toFixed(2)}`}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary mt-6 flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Security Note */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  <Heart className="w-4 h-4 inline text-red-500" />
                  {' '}Secure checkout powered by industry-leading encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
