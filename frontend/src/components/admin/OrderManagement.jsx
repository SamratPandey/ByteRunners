import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  Eye,
  Download,
  RefreshCcw,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Calendar,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import RefundModal from './RefundModal';
import { adminCourseApi } from '../../utils/adminCourseApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import OrderDetails from './OrderDetails';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal states
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter, paymentMethodFilter, sortBy, dateFrom, dateTo]);
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        paymentMethod: paymentMethodFilter !== 'all' ? paymentMethodFilter : undefined,
        sort: sortBy,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const response = await adminCourseApi.getOrders(params);
      setOrders(response.data.data);
      setPagination(response.data.pagination);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };
  const handleUpdateStatus = async (orderId, status, adminNotes = '') => {
    try {
      await adminCourseApi.updateOrderStatus(orderId, { status, adminNotes });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleRefund = (order) => {
    setSelectedOrder(order);
    setShowRefundModal(true);
  };

  const handleProcessRefund = async (refundData) => {
    try {
      await adminCourseApi.processRefund(refundData);
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process refund');
      throw error;
    }
  };
  const handleRefundSuccess = () => {
    setShowRefundModal(false);
    fetchOrders();
  };
  const handleViewAnalytics = () => {
    // For now, we'll show an alert. In a real app, this would navigate to analytics page
    toast.success('Order Analytics - Feature coming soon!');
  };

  const handleExportOrders = async () => {
    try {
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const response = await adminCourseApi.exportOrdersCSV(params);
      
      // Convert to CSV and download
      const csvContent = convertToCSV(response.data.data);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error('Failed to export orders');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => `"${value}"`).join(',')
    ).join('\n');
    
    return `${headers}\n${rows}`;
  };
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
  const getPaymentMethodBadge = (method) => {
    const variants = {
      razorpay: 'info',
      stripe: 'premium',
      paypal: 'warning',
      upi: 'success',
      card: 'secondary'
    };

    return (
      <Badge variant={variants[method] || variants.card}>
        {method.toUpperCase()}
      </Badge>
    );
  };

  const formatPrice = (amount) => {
    return `₹${amount?.toFixed(2) || '0.00'}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600">View and manage course orders</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleViewAnalytics} variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button onClick={handleExportOrders} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed || 0}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending || 0}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.failed || 0}</p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{formatPrice(stats.avgOrderValue)}</p>
                <p className="text-sm text-gray-600">Avg Order</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="razorpay">Razorpay</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            
            <Input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="amount-high">Amount (High)</SelectItem>
                <SelectItem value="amount-low">Amount (Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm">{order.invoiceNumber}</p>
                          <p className="text-xs text-gray-500">{order._id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={order.user?.avatar || '/images/user.png'}
                            alt={order.user?.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium">{order.user?.name}</p>
                            <p className="text-sm text-gray-500">{order.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.courses?.length} course(s)</p>
                          <p className="text-sm text-gray-500">
                            {order.courses?.map(c => c.course?.title).join(', ').substring(0, 30)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold">{formatPrice(order.totalAmount)}</p>
                          {order.coupon && (
                            <p className="text-xs text-green-600">
                              Coupon: {order.coupon.code}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentMethodBadge(order.paymentMethod)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {order.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, 'completed')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Completed
                              </DropdownMenuItem>
                            )}
                            {order.status === 'completed' && (
                              <DropdownMenuItem onClick={() => handleRefund(order)}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Process Refund
                              </DropdownMenuItem>
                            )}
                            {(order.status === 'pending' || order.status === 'failed') && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalOrders)} of {pagination.totalOrders} orders
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Complete order information and management
            </DialogDescription>
          </DialogHeader>
          <OrderDetails
            order={selectedOrder}
            onUpdateStatus={handleUpdateStatus}
            onClose={() => setShowOrderDetails(false)}
          />
        </DialogContent>
      </Dialog>      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        order={selectedOrder}
        onRefund={handleProcessRefund}
      />
    </div>
  );
};

export default OrderManagement;
