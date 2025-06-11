const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const Activity = require('../models/Activity');

// Get all courses for admin
exports.getAllCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      category,
      level,
      sort = 'newest'
    } = req.query;

    // Build filter
    let filter = {};
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'instructor.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      if (status === 'published') filter.isPublished = true;
      if (status === 'draft') filter.isPublished = false;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (level && level !== 'all') {
      filter.level = level;
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
      case 'title':
        sortBy = { title: 1 };
        break;
      case 'enrollments':
        sortBy = { totalEnrollments: -1 };
        break;
      case 'rating':
        sortBy = { averageRating: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(filter)
      .populate('instructor', 'name email avatar')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCourses = await Course.countDocuments(filter);
    const totalPages = Math.ceil(totalCourses / parseInt(limit));

    // Get course statistics
    const stats = {
      total: await Course.countDocuments(),
      published: await Course.countDocuments({ isPublished: true }),
      draft: await Course.countDocuments({ isPublished: false }),
      free: await Course.countDocuments({ isFree: true }),
      paid: await Course.countDocuments({ isFree: false })
    };

    res.status(200).json({
      success: true,
      data: courses,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCourses,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      },
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// Get single course by ID
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email avatar bio')
      .populate('reviews.user', 'name avatar')
      .populate('enrollments.user', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      instructor: req.body.instructor || req.admin.id // Default to admin if no instructor specified
    };

    // Generate slug from title
    if (!courseData.slug) {
      courseData.slug = courseData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
    }

    const course = new Course(courseData);
    await course.save();

    // Log activity
    const activity = new Activity({
      type: 'Course Created',
      description: `Course "${course.title}" was created by admin ${req.admin.username}.`,
    });
    await activity.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: populatedCourse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const allowedFields = [
      'title', 'slug', 'subtitle', 'description', 'summary', 'thumbnail',
      'previewVideo', 'introVideo', 'price', 'originalPrice', 'discountPercentage',
      'isFree', 'currency', 'category', 'subcategory', 'topic', 'tags',
      'language', 'level', 'instructor', 'whatYouWillLearn', 'prerequisites',
      'targetAudience', 'curriculum', 'coupons', 'featured', 'bestseller',
      'isPublished', 'metaDescription', 'metaKeywords', 'hasSubtitles',
      'hasCertificate', 'lifetime_access', 'mobile_access'
    ];

    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    // Update published date if publishing
    if (filteredBody.isPublished && req.body.isPublished) {
      filteredBody.publishedAt = new Date();
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...filteredBody, lastUpdated: new Date() },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Log activity
    const activity = new Activity({
      type: 'Course Updated',
      description: `Course "${course.title}" was updated by admin ${req.admin.username}.`,
    });
    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course has enrollments
    if (course.totalEnrollments > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete course with active enrollments'
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    // Log activity
    const activity = new Activity({
      type: 'Course Deleted',
      description: `Course "${course.title}" was deleted by admin ${req.admin.username}.`,
    });
    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

// Add/Update course curriculum
exports.updateCurriculum = async (req, res) => {
  try {
    const { curriculum } = req.body;
    
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { 
        curriculum,
        lastUpdated: new Date()
      },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Curriculum updated successfully',
      data: course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating curriculum',
      error: error.message
    });
  }
};

// Add coupon to course
exports.addCoupon = async (req, res) => {
  try {
    const { code, discount, validFrom, validUntil, maxUses } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if coupon code already exists for this course
    const existingCoupon = course.coupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists for this course'
      });
    }

    const newCoupon = {
      code: code.toUpperCase(),
      discount,
      validFrom: validFrom || new Date(),
      validUntil: validUntil ? new Date(validUntil) : undefined,
      maxUses: maxUses || 1,
      usedCount: 0,
      isActive: true
    };

    course.coupons.push(newCoupon);
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Coupon added successfully',
      data: course.coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding coupon',
      error: error.message
    });
  }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const updates = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const coupon = course.coupons.id(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    Object.keys(updates).forEach(key => {
      if (key !== '_id') {
        coupon[key] = updates[key];
      }
    });

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      data: course.coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating coupon',
      error: error.message
    });
  }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    course.coupons.id(couponId).remove();
    await course.save();

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
      data: course.coupons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon',
      error: error.message
    });
  }
};

// Get course analytics
exports.getCourseAnalytics = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    const course = await Course.findById(courseId)
      .populate('enrollments.user', 'name email')
      .populate('reviews.user', 'name avatar');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Get enrollment stats
    const enrollmentStats = {
      total: course.totalEnrollments,
      thisMonth: course.enrollments.filter(e => 
        new Date(e.enrolledAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      thisWeek: course.enrollments.filter(e => 
        new Date(e.enrolledAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    };

    // Get revenue stats
    const orders = await Order.find({
      'courses.course': courseId,
      status: 'completed'
    });

    const revenueStats = {
      total: orders.reduce((sum, order) => {
        const courseOrder = order.courses.find(c => c.course.toString() === courseId);
        return sum + (courseOrder?.price || 0);
      }, 0),
      thisMonth: orders.filter(o => 
        new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).reduce((sum, order) => {
        const courseOrder = order.courses.find(c => c.course.toString() === courseId);
        return sum + (courseOrder?.price || 0);
      }, 0)
    };

    // Get completion rate
    const completedEnrollments = course.enrollments.filter(e => e.progress === 100).length;
    const completionRate = course.totalEnrollments > 0 
      ? Math.round((completedEnrollments / course.totalEnrollments) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        },
        enrollmentStats,
        revenueStats,
        completionRate,
        averageRating: course.averageRating,
        totalReviews: course.totalReviews,
        views: course.views
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course analytics',
      error: error.message
    });
  }
};