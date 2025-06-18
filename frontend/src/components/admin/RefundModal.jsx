import { useState } from 'react';
import { X, AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RefundModal = ({ isOpen, onClose, order, onRefund }) => {
  const [refundData, setRefundData] = useState({
    amount: order?.totalAmount || 0,
    reason: '',
    type: 'full', // full or partial
    refundMethod: 'original', // original, store_credit, manual
    notes: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRefundData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!refundData.reason.trim()) {
      newErrors.reason = 'Refund reason is required';
    }

    if (refundData.type === 'partial') {
      if (!refundData.amount || refundData.amount <= 0) {
        newErrors.amount = 'Refund amount must be greater than 0';
      }
      if (refundData.amount > order.totalAmount) {
        newErrors.amount = 'Refund amount cannot exceed order total';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);
    
    try {
      const refundPayload = {
        orderId: order._id,
        amount: refundData.type === 'full' ? order.totalAmount : refundData.amount,
        reason: refundData.reason,
        type: refundData.type,
        refundMethod: refundData.refundMethod,
        notes: refundData.notes
      };

      await onRefund(refundPayload);
      onClose();
      
      // Reset form
      setRefundData({
        amount: order?.totalAmount || 0,
        reason: '',
        type: 'full',
        refundMethod: 'original',
        notes: ''
      });
    } catch (error) {
      console.error('Refund processing failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTypeChange = (type) => {
    setRefundData(prev => ({
      ...prev,
      type,
      amount: type === 'full' ? order.totalAmount : 0
    }));
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Process Refund</h2>
              <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{order.user?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Total:</span>
                <span className="font-medium">${order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-medium ${
                  order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <p>Processing a refund will refund the customer and update the order status. This action cannot be undone.</p>
              </div>
            </div>
          </div>

          {/* Refund Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Refund Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange('full')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  refundData.type === 'full'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">Full Refund</div>
                <div className="text-sm text-gray-500">Refund entire order amount</div>
                <div className="text-lg font-semibold text-indigo-600 mt-1">
                  ${order.totalAmount}
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('partial')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  refundData.type === 'partial'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="font-medium text-gray-900">Partial Refund</div>
                <div className="text-sm text-gray-500">Refund custom amount</div>
                <div className="text-sm text-gray-400 mt-1">
                  Up to ${order.totalAmount}
                </div>
              </button>
            </div>
          </div>

          {/* Partial Refund Amount */}
          {refundData.type === 'partial' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="amount"
                  value={refundData.amount}
                  onChange={handleInputChange}
                  min="0"
                  max={order.totalAmount}
                  step="0.01"
                  className={`block w-full pl-7 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>
          )}

          {/* Refund Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Method
            </label>
            <select
              name="refundMethod"
              value={refundData.refundMethod}
              onChange={handleInputChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="original">Original Payment Method</option>
              <option value="store_credit">Store Credit</option>
              <option value="manual">Manual Process</option>
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refund Reason *
            </label>
            <select
              name="reason"
              value={refundData.reason}
              onChange={handleInputChange}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select a reason</option>
              <option value="customer_request">Customer Request</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="course_cancelled">Course Cancelled</option>
              <option value="duplicate_payment">Duplicate Payment</option>
              <option value="billing_error">Billing Error</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="other">Other</option>
            </select>
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={refundData.notes}
              onChange={handleInputChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any additional notes about this refund..."
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t">          <Button
            type="button"
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            variant="destructive"
            className="flex items-center space-x-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span>Process Refund</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;
