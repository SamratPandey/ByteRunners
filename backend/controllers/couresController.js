const Course = require('../models/Course');
const User = require('../models/User');
const Order = require('../models/Order');
const Wishlist = require('../models/Wishlist');

const getCourses = async (req, res) => {
    try {
        console.log('getCourses called with query:', req.query);
        
        const {
            page = 1,
            limit = 12,
            category,
            level,
            price,
            rating,
            sort = 'newest',
            search,
            featured,
            bestseller
        } = req.query;

        // Build filter object
        let filter = { isPublished: true };
        console.log('Initial filter:', filter);
        
        if (category && category !== 'all') {
            filter.category = { $regex: category, $options: 'i' };
        }
        
        if (level && level !== 'all') {
            filter.level = level;
        }
        
        if (price === 'free') {
            filter.isFree = true;
        } else if (price === 'paid') {
            filter.isFree = false;
        }
        
        if (rating) {
            filter.averageRating = { $gte: parseInt(rating) };
        }
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        if (featured === 'true') {
            filter.featured = true;
        }
        
        if (bestseller === 'true') {
            filter.bestseller = true;
        }

        console.log('Final filter:', filter);

        // Build sort object
        let sortBy = {};
        switch (sort) {
            case 'newest':
                sortBy = { createdAt: -1 };
                break;
            case 'oldest':
                sortBy = { createdAt: 1 };
                break;
            case 'price-low':
                sortBy = { price: 1 };
                break;
            case 'price-high':
                sortBy = { price: -1 };
                break;
            case 'rating':
                sortBy = { averageRating: -1 };
                break;
            case 'popular':
                sortBy = { totalEnrollments: -1 };
                break;
            default:
                sortBy = { createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        console.log('Executing query...');
        const courses = await Course.find(filter)
            .populate('instructor', 'name avatar bio')
            .sort(sortBy)
            .skip(skip)
            .limit(parseInt(limit))
            .select('-reviews -enrollments'); // Exclude heavy arrays for listing

        console.log('Found courses:', courses.length);

        const totalCourses = await Course.countDocuments(filter);
        console.log('Total courses matching filter:', totalCourses);
        
        const totalPages = Math.ceil(totalCourses / parseInt(limit));

        // Get categories for filter options
        const categories = await Course.distinct('category', { isPublished: true });
        console.log('Categories:', categories);

        res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            courses,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalCourses,
                hasNext: parseInt(page) < totalPages,
                hasPrev: parseInt(page) > 1
            },
            filters: {
                categories: categories.sort()
            }
        });
    } catch (error) {
        console.error('Error in getCourses:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Get course by ID with full details
const getCourseById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    
    try {
        const course = await Course.findById(id)
            .populate('instructor', 'name avatar bio socialLinks')
            .populate('reviews.user', 'name avatar');

        if (!course) {
            return res.status(404).json({ 
                success: false,
                message: "Course not found" 
            });
        }

        // Increment view count
        course.views = (course.views || 0) + 1;
        await course.save();

        // Check if user is enrolled or has purchased
        let isEnrolled = false;
        let isPurchased = false;
        let userProgress = null;
        let isInWishlist = false;

        if (userId) {
            const user = await User.findById(userId);
            
            // Check if purchased
            isPurchased = user.purchasedCourses.some(pc => 
                pc.course.toString() === course._id.toString()
            );
            
            // Check if enrolled
            const enrollment = user.enrolledCourses.find(ec => 
                ec.course.toString() === course._id.toString()
            );
            
            if (enrollment) {
                isEnrolled = true;
                userProgress = enrollment;
            }

            // Check wishlist
            const wishlist = await Wishlist.findOne({ user: userId });
            if (wishlist) {
                isInWishlist = wishlist.courses.some(wc => 
                    wc.course.toString() === course._id.toString()
                );
            }
        }

        // Get related courses
        const relatedCourses = await Course.find({
            _id: { $ne: course._id },
            category: course.category,
            isPublished: true
        })
        .populate('instructor', 'name avatar')
        .limit(4)
        .select('title thumbnail price isFree averageRating totalEnrollments level instructor');

        res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            course,
            userInfo: {
                isEnrolled,
                isPurchased,
                userProgress,
                isInWishlist
            },
            relatedCourses
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Purchase course
const purchaseCourse = async (req, res) => {
    try {
        const { courseId, paymentDetails, couponCode } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check if already purchased
        const user = await User.findById(userId);
        const alreadyPurchased = user.purchasedCourses.some(pc => 
            pc.course.toString() === courseId
        );

        if (alreadyPurchased) {
            return res.status(400).json({
                success: false,
                message: "Course already purchased"
            });
        }

        let finalPrice = course.price;
        let discountAmount = 0;
        let couponUsed = null;

        // Apply coupon if provided
        if (couponCode && !course.isFree) {
            const coupon = course.coupons.find(c => 
                c.code === couponCode.toUpperCase() && 
                c.isActive && 
                c.usedCount < c.maxUses &&
                (!c.validUntil || new Date() <= c.validUntil)
            );

            if (coupon) {
                discountAmount = Math.round((course.price * coupon.discount) / 100);
                finalPrice = course.price - discountAmount;
                couponUsed = {
                    code: coupon.code,
                    discountPercentage: coupon.discount,
                    discountAmount
                };
                
                // Update coupon usage
                coupon.usedCount += 1;
            }
        }

        // Create order
        const order = new Order({
            user: userId,
            courses: [{
                course: courseId,
                price: finalPrice,
                originalPrice: course.price,
                discountAmount
            }],
            totalAmount: finalPrice,
            paymentMethod: paymentDetails.method,
            paymentId: paymentDetails.paymentId,
            razorpayOrderId: paymentDetails.razorpayOrderId,
            razorpayPaymentId: paymentDetails.razorpayPaymentId,
            razorpaySignature: paymentDetails.razorpaySignature,
            status: 'completed',
            paidAt: new Date(),
            coupon: couponUsed
        });

        await order.save();

        // Add to user's purchased courses
        user.purchasedCourses.push({
            course: courseId,
            purchasedAt: new Date(),
            price: finalPrice,
            orderId: order._id
        });

        // Add to enrolled courses
        user.enrolledCourses.push({
            course: courseId,
            enrolledAt: new Date(),
            progress: 0
        });

        await user.save();

        // Add enrollment to course
        course.enrollments.push({
            user: userId,
            enrolledAt: new Date(),
            paymentDetails: {
                transactionId: paymentDetails.paymentId,
                amount: finalPrice,
                paymentMethod: paymentDetails.method,
                couponUsed: couponCode,
                discountAmount
            }
        });

        await course.save();

        res.status(200).json({
            success: true,
            message: "Course purchased successfully",
            order,
            course: {
                id: course._id,
                title: course.title,
                thumbnail: course.thumbnail
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add course to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id;

        let wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, courses: [] });
        }

        // Check if course already in wishlist
        const existingCourse = wishlist.courses.find(c => 
            c.course.toString() === courseId
        );

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: "Course already in wishlist"
            });
        }

        wishlist.courses.push({ course: courseId });
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Course added to wishlist"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove course from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId });
        
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: "Wishlist not found"
            });
        }

        wishlist.courses = wishlist.courses.filter(c => 
            c.course.toString() !== courseId
        );
        
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: "Course removed from wishlist"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlist = await Wishlist.findOne({ user: userId })
            .populate({
                path: 'courses.course',
                populate: {
                    path: 'instructor',
                    select: 'name avatar'
                }
            });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                message: "Wishlist fetched successfully",
                courses: []
            });
        }

        res.status(200).json({
            success: true,
            message: "Wishlist fetched successfully",
            courses: wishlist.courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add course review
const addReview = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }

        // Check if user has purchased the course
        const user = await User.findById(userId);
        const hasPurchased = user.purchasedCourses.some(pc => 
            pc.course.toString() === courseId
        );

        // Check if user already reviewed
        const existingReview = course.reviews.find(r => 
            r.user.toString() === userId
        );

        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.comment = comment;
            existingReview.ratedAt = new Date();
        } else {
            // Add new review
            course.reviews.push({
                user: userId,
                rating,
                comment,
                isVerifiedPurchase: hasPurchased
            });
        }

        await course.save();

        res.status(200).json({
            success: true,
            message: existingReview ? "Review updated successfully" : "Review added successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get featured courses
const getFeaturedCourses = async (req, res) => {
    try {
        const courses = await Course.find({ 
            isPublished: true, 
            featured: true 
        })
        .populate('instructor', 'name avatar')
        .limit(8)
        .select('title thumbnail price isFree averageRating totalEnrollments level instructor');

        res.status(200).json({
            success: true,
            message: "Featured courses fetched successfully",
            courses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get course statistics
const getCourseStats = async (req, res) => {
    try {
        const totalCourses = await Course.countDocuments({ isPublished: true });
        const totalStudents = await User.countDocuments();
        const totalEnrollments = await Course.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: null, total: { $sum: "$totalEnrollments" } } }
        ]);

        const categories = await Course.aggregate([
            { $match: { isPublished: true } },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                totalCourses,
                totalStudents,
                totalEnrollments: totalEnrollments[0]?.total || 0,
                categoriesBreakdown: categories
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getCourses,
    getCourseById,
    purchaseCourse,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    addReview,
    getFeaturedCourses,
    getCourseStats
};

