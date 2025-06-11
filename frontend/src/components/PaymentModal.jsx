import React, { useState } from 'react';
import { X, CreditCard, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, course, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      // Mock coupon validation - in real app, this would be an API call
      if (couponCode.toUpperCase() === 'SAVE20') {
        const discount = Math.round(course.price * 0.2);
        setAppliedCoupon({
          code: couponCode.toUpperCase(),
          discount: 20,
          discountAmount: discount
        });
        toast.success('Coupon applied successfully!');
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
    }
  };

  const calculateFinalPrice = () => {
    if (course.isFree) return 0;
    let finalPrice = course.price;
    if (appliedCoupon) {
      finalPrice -= appliedCoupon.discountAmount;
    }
    return Math.max(finalPrice, 0);
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Mock payment process - in real app, integrate with Razorpay/Stripe
      const paymentData = {
        courseId: course._id,
        paymentDetails: {
          method: paymentMethod,
          paymentId: `payment_${Date.now()}`,
          razorpayOrderId: `order_${Date.now()}`,
          razorpayPaymentId: `pay_${Date.now()}`,
          razorpaySignature: 'mock_signature'
        },
        couponCode: appliedCoupon?.code
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful response
      const response = {
        data: {
          success: true,
          message: 'Course purchased successfully',
          order: { _id: `order_${Date.now()}` },
          course: { id: course._id, title: course.title }
        }
      };

      toast.success('🎉 Course purchased successfully! Welcome to your learning journey!');
      onSuccess(response.data);
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-black/90 backdrop-blur-xl border border-green-900/50 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Course Info */}
          <div className="mb-6">
            <img 
              src={course.thumbnail} 
              alt={course.title}
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
            <p className="text-gray-400 text-sm">{course.subtitle}</p>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            <div className="bg-green-900/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Course Price:</span>
                <span className="text-white">₹{course.price.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-400">Discount ({appliedCoupon.discount}%):</span>
                  <span className="text-green-400">-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-green-900/50 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total:</span>
                  <span className="text-xl font-bold text-green-500">
                    ₹{calculateFinalPrice().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          {!course.isFree && (
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Coupon Code (Optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 bg-black/40 border border-green-900/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={appliedCoupon}
                />
                <Button
                  onClick={handleApplyCoupon}
                  disabled={!couponCode.trim() || appliedCoupon}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between">
                  <Badge className="bg-green-600 text-white">
                    {appliedCoupon.code} Applied
                  </Badge>
                  <button
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponCode('');
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          {!course.isFree && (
            <div className="mb-6">
              <label className="block text-gray-300 mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-green-900/50 cursor-pointer hover:border-green-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-green-500"
                  />
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <span className="text-white">Credit/Debit Card & UPI</span>
                </label>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3">What's Included:</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-green-400" />
                <span>Lifetime access</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Certificate of completion</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <CreditCard className="w-4 h-4 text-green-400" />
                <span>30-day money-back guarantee</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-green-900/50 text-gray-300 hover:text-white hover:border-green-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Processing...' : course.isFree ? 'Enroll Free' : `Pay ₹${calculateFinalPrice().toFixed(2)}`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PaymentModal;
