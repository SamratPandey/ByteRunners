const Order = require('../models/Order');
const User = require('../models/User');
const Course = require('../models/Course');
const Activity = require('../models/Activity');
const { sendCoursePurchaseEmail } = require('./sendMail');

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      paymentMethod,
      sort = 'newest',
      dateFrom,
      dateTo
    } = req.query;

    // Build filter
    let filter = {};
    
    if (search) {
      // Search in user name, email, or invoice number
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      filter.$or = [
        { user: { $in: users.map(u => u._id) } },
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Sort options
    let sortBy = {};
    switch (sort) {
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      case 'oldest':
        sortBy = { createdAt: 1 };
        break;
      case 'amount-high':
        sortBy = { totalAmount: -1 };
        break;
      case 'amount-low':
        sortBy = { totalAmount: 1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .populate('user', 'name email avatar')
      .populate('courses.course', 'title thumbnail')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    // Get order statistics
    const stats = {
      total: await Order.countDocuments(),
      completed: await Order.countDocuments({ status: 'completed' }),
      pending: await Order.countDocuments({ status: 'pending' }),
      failed: await Order.countDocuments({ status: 'failed' }),
      refunded: await Order.countDocuments({ status: 'refunded' })
    };

    // Get revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const revenue = revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 };

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalOrders,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      stats: {
        ...stats,
        totalRevenue: revenue.totalRevenue,
        avgOrderValue: Math.round(revenue.avgOrderValue || 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order by ID
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email avatar phone')
      .populate('courses.course', 'title thumbnail instructor')
      .populate('courses.course.instructor', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const allowedStatuses = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;

    // Update timestamps based on status
    if (status === 'completed' && oldStatus !== 'completed') {
      order.paidAt = new Date();
    } else if (status === 'failed' && oldStatus !== 'failed') {
      order.failedAt = new Date();
    } else if (status === 'refunded' && oldStatus !== 'refunded') {
      order.refundedAt = new Date();
    }

    await order.save();

    // Log activity
    const activity = new Activity({
      type: 'Order Status Updated',
      description: `Order ${order.invoiceNumber} status changed from ${oldStatus} to ${status} by admin ${req.admin.username}.`,
    });
    await activity.save();

    // If order is completed and wasn't before, handle enrollment
    if (status === 'completed' && oldStatus !== 'completed') {
      await handleOrderCompletion(order);
    }

    const updatedOrder = await Order.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('courses.course', 'title thumbnail');

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { refundAmount, refundReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only refund completed orders'
      });
    }

    order.status = 'refunded';
    order.refundAmount = refundAmount || order.totalAmount;
    order.refundReason = refundReason;
    order.refundedAt = new Date();

    await order.save();

    // Log activity
    const activity = new Activity({
      type: 'Order Refunded',
      description: `Order ${order.invoiceNumber} refunded ₹${order.refundAmount} by admin ${req.admin.username}. Reason: ${refundReason}`,
    });
    await activity.save();

    // TODO: Handle actual refund processing with payment gateway
    // For now, just update the order status

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
};

// Get order analytics
exports.getOrderAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    // Revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    // Top courses by revenue
    const topCourses = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      { $unwind: '$courses' },
      {
        $group: {
          _id: '$courses.course',
          revenue: { $sum: '$courses.price' },
          orders: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          title: '$course.title',
          thumbnail: '$course.thumbnail',
          revenue: 1,
          orders: 1
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Payment method breakdown
    const paymentMethods = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Overall stats
    const overallStats = await Order.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, '$totalAmount', 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: periodDays,
        revenueData,
        topCourses,
        paymentMethods,
        overallStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order analytics',
      error: error.message
    });
  }
};

// Export orders to CSV
exports.exportOrders = async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;
    
    let filter = {};
    if (status && status !== 'all') filter.status = status;
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('courses.course', 'title')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = orders.map(order => ({
      'Order ID': order._id,
      'Invoice Number': order.invoiceNumber,
      'Customer Name': order.user.name,
      'Customer Email': order.user.email,
      'Courses': order.courses.map(c => c.course.title).join('; '),
      'Total Amount': order.totalAmount,
      'Payment Method': order.paymentMethod,
      'Status': order.status,
      'Order Date': order.createdAt.toLocaleDateString(),
      'Payment Date': order.paidAt ? order.paidAt.toLocaleDateString() : '',
    }));

    res.status(200).json({
      success: true,
      data: csvData,
      message: 'Orders exported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error exporting orders',
      error: error.message
    });
  }
};

// Helper function to handle order completion
const handleOrderCompletion = async (order) => {
  try {
    const user = await User.findById(order.user);
    if (!user) return;

    // Populate order with course details for email
    await order.populate('courses.course', 'title description thumbnail');
    
    const purchasedCourses = [];

    // Add courses to user's purchased and enrolled courses
    for (const courseItem of order.courses) {
      const courseId = courseItem.course;
      
      // Check if already purchased
      const alreadyPurchased = user.purchasedCourses.some(pc => 
        pc.course.toString() === courseId.toString()
      );
      
      if (!alreadyPurchased) {
        // Add to purchased courses
        user.purchasedCourses.push({
          course: courseId,
          purchasedAt: order.paidAt || new Date(),
          price: courseItem.price,
          orderId: order._id
        });

        // Add to enrolled courses
        user.enrolledCourses.push({
          course: courseId,
          enrolledAt: order.paidAt || new Date(),
          progress: 0
        });

        // Add course details for email
        purchasedCourses.push({
          title: courseItem.course.title,
          description: courseItem.course.description,
          price: courseItem.price,
          purchaseDate: (order.paidAt || new Date()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });

        // Update course enrollment
        const course = await Course.findById(courseId);
        if (course) {
          course.enrollments.push({
            user: user._id,
            enrolledAt: order.paidAt || new Date(),
            paymentDetails: {
              transactionId: order.paymentId,
              amount: courseItem.price,
              paymentMethod: order.paymentMethod
            }
          });
          await course.save();
        }
      }
    }

    await user.save();

    // Send course purchase email if there are newly purchased courses
    if (purchasedCourses.length > 0) {
      try {
        await sendCoursePurchaseEmail(user.email, {
          name: user.name,
          courses: purchasedCourses,
          orderId: order._id.toString(),
          invoiceNumber: order.invoiceNumber,
          totalAmount: order.totalAmount.toFixed(2),
          paymentMethod: order.paymentMethod || 'Online Payment',
          purchaseDate: (order.paidAt || new Date()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        });
        console.log('Course purchase email sent successfully to:', user.email);
      } catch (emailError) {
        console.error('Failed to send course purchase email:', emailError);
        // Don't fail the order completion if email fails
      }
    }

  } catch (error) {
    console.error('Error handling order completion:', error);
  }
};

// Note: All functions are already exported using exports.functionName syntax above
// No need for additional module.exports since they're already available
