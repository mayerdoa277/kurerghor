import { useState } from 'react'
import toast from 'react-hot-toast'

const CouponForm = ({ onApply, onRemove, appliedCoupon, disabled = false }) => {
  const [couponCode, setCouponCode] = useState('')
  const [isApplying, setIsApplying] = useState(false)

  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code')
      return
    }

    setIsApplying(true)

    try {
      // In a real implementation, this would validate with API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (onApply) {
        await onApply(couponCode)
      }
      
      setCouponCode('')
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code')
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveCoupon = () => {
    if (onRemove) {
      onRemove()
    }
  }

  if (appliedCoupon) {
    return (
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="font-medium text-gray-900 mb-3">Have a coupon?</h3>
      
      <form onSubmit={handleApplyCoupon} className="space-y-3">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Enter coupon code"
          className="input"
          disabled={disabled}
        />
        
        <button
          type="submit"
          disabled={disabled || isApplying || !couponCode.trim()}
          className="w-full btn-outline"
        >
          {isApplying ? 'Applying...' : 'Apply Coupon'}
        </button>
      </form>
    </div>
  )
}

export default CouponForm
