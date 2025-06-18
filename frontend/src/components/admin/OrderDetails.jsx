import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCcw,
  Download,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const OrderDetails = ({ order, onUpdateStatus, onClose }) => {
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!order) return null;
  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { variant: 'success', icon: CheckCircle },
      pending: { variant: 'warning', icon: Clock },
      failed: { variant: 'destructive', icon: XCircle },
      cancelled: { variant: 'secondary', icon: XCircle },
      refunded: { variant: 'info', icon: RefreshCcw }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await onUpdateStatus(order._id, newStatus, statusNotes);
      setStatusNotes('');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold">Order Details</h3>
          <p className="text-gray-600">{order.invoiceNumber}</p>
        </div>
        <div className="text-right">
          {getStatusBadge(order.status)}
          <p className="text-sm text-gray-600 mt-1">
            Created: {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Customer Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src={order.user?.avatar || '/images/user.png'}
                alt={order.user?.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-semibold">{order.user?.name}</h4>
                <p className="text-sm text-gray-600">{order.user?.email}</p>
              </div>
            </div>

            {order.billingAddress && (
              <>
                <Separator />
                <div>
                  <h5 className="font-medium mb-2">Billing Address</h5>
                  <div className="space-y-1 text-sm">
                    <p>{order.billingAddress.firstName} {order.billingAddress.lastName}</p>
                    <p>{order.billingAddress.address}</p>
                    <p>{order.billingAddress.city}, {order.billingAddress.state}</p>
                    <p>{order.billingAddress.country} - {order.billingAddress.zipCode}</p>
                    {order.billingAddress.phone && (
                      <p className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{order.billingAddress.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Payment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">{order.paymentMethod?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
              </div>
            </div>

            {order.paymentId && (
              <div>
                <p className="text-sm text-gray-600">Payment ID</p>
                <p className="font-mono text-sm">{order.paymentId}</p>
              </div>
            )}

            {order.razorpayOrderId && (
              <div>
                <p className="text-sm text-gray-600">Razorpay Order ID</p>
                <p className="font-mono text-sm">{order.razorpayOrderId}</p>
              </div>
            )}

            {order.coupon && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-gray-600">Coupon Applied</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{order.coupon.code}</Badge>
                    <span className="text-sm">{order.coupon.discountPercentage}% off</span>
                  </div>
                  <p className="text-sm text-green-600">
                    Discount: -{formatPrice(order.coupon.discountAmount)}
                  </p>
                </div>
              </>
            )}

            {order.paidAt && (
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="text-sm">{formatDate(order.paidAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Courses Ordered</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.courses?.map((courseItem, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                <img
                  src={courseItem.course?.thumbnail || '/images/course-placeholder.png'}
                  alt={courseItem.course?.title}
                  className="w-16 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">{courseItem.course?.title}</h4>
                  <p className="text-sm text-gray-600">
                    by {courseItem.course?.instructor?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{formatPrice(courseItem.price)}</p>
                  {courseItem.originalPrice > courseItem.price && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(courseItem.originalPrice)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div>
                <p className="font-medium">Order Created</p>
                <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {order.paidAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <div>
                  <p className="font-medium">Payment Completed</p>
                  <p className="text-sm text-gray-600">{formatDate(order.paidAt)}</p>
                </div>
              </div>
            )}

            {order.failedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-destructive rounded-full"></div>
                <div>
                  <p className="font-medium">Payment Failed</p>
                  <p className="text-sm text-gray-600">{formatDate(order.failedAt)}</p>
                </div>
              </div>
            )}

            {order.refundedAt && (
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-info rounded-full"></div>
                <div>
                  <p className="font-medium">Order Refunded</p>
                  <p className="text-sm text-gray-600">{formatDate(order.refundedAt)}</p>
                  {order.refundReason && (
                    <p className="text-sm text-gray-500">Reason: {order.refundReason}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Management */}
      {order.status !== 'refunded' && (
        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Update Order Status</Label>
              <div className="flex space-x-2 mt-2">
                {order.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleStatusUpdate('completed')}                      disabled={updating}
                      variant="success"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Completed
                    </Button>
                    <Button
                      onClick={() => handleStatusUpdate('failed')}
                      disabled={updating}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Mark Failed
                    </Button>
                  </>
                )}
                
                {(order.status === 'pending' || order.status === 'failed') && (
                  <Button
                    onClick={() => handleStatusUpdate('cancelled')}
                    disabled={updating}
                    variant="outline"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="statusNotes">Admin Notes</Label>
              <Textarea
                id="statusNotes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add notes about status change..."
                rows={3}
              />
            </div>

            {order.adminNotes && (
              <div>
                <Label>Previous Admin Notes</Label>
                <div className="p-3 bg-gray-50 rounded border text-sm">
                  {order.adminNotes}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        {order.invoiceUrl && (
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
