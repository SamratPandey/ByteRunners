const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      type = null, 
      unreadOnly = false 
    } = req.query;

    const notifications = await Notification.getUserNotifications(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map(notif => ({
          id: notif._id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          priority: notif.priority,
          read: notif.read,
          time: notif.timeAgo,
          createdAt: notif.createdAt,
          actionUrl: notif.actionUrl,
          actionText: notif.actionText,
          metadata: notif.metadata
        })),
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          hasMore: notifications.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications'
    });
  }
};

// Mark notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.markAsRead(userId, notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification'
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications'
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count'
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification'
    });
  }
};

// Create notification (for system use)
exports.createNotification = async (req, res) => {
  try {
    const { userId, title, message, type, priority, actionUrl, actionText, metadata } = req.body;

    const notification = await Notification.createForUser(userId, {
      title,
      message,
      type,
      priority,
      actionUrl,
      actionText,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification'
    });
  }
};

// Utility functions for creating specific types of notifications

// Create achievement notification (when user solves a problem)
exports.createAchievementNotification = async (userId, problemTitle, points = 0) => {
  try {
    return await Notification.createForUser(userId, {
      title: "Problem Solved! 🎉",
      message: `Congratulations! You solved '${problemTitle}' problem`,
      type: 'achievement',
      priority: 'medium',
      actionUrl: '/problems',
      actionText: 'View More Problems',
      metadata: {
        achievementType: 'problem_solved',
        points
      }
    });
  } catch (error) {
    console.error('Error creating achievement notification:', error);
    throw error;
  }
};

// Create course enrollment notification
exports.createCourseNotification = async (userId, courseTitle, courseId) => {
  try {
    return await Notification.createForUser(userId, {
      title: "Course Enrolled ✅",
      message: `You have successfully enrolled in ${courseTitle}`,
      type: 'course',
      priority: 'medium',
      actionUrl: `/course-details/${courseId}`,
      actionText: 'View Course',
      metadata: {
        courseId
      }
    });
  } catch (error) {
    console.error('Error creating course notification:', error);
    throw error;
  }
};

// Create job application notification
exports.createJobNotification = async (userId, jobTitle, company, jobId) => {
  try {
    return await Notification.createForUser(userId, {
      title: "Job Application Submitted 📝",
      message: `Your application for ${jobTitle} at ${company} has been submitted`,
      type: 'job',
      priority: 'medium',
      actionUrl: `/job`,
      actionText: 'View Jobs',
      metadata: {
        jobId
      }
    });
  } catch (error) {
    console.error('Error creating job notification:', error);
    throw error;
  }
};

// Create contest notification
exports.createContestNotification = async (userId, contestTitle, startTime) => {
  try {
    return await Notification.createForUser(userId, {
      title: "Contest Reminder ⏰",
      message: `${contestTitle} starts soon!`,
      type: 'contest',
      priority: 'high',
      actionUrl: '/contests',
      actionText: 'Join Contest',
      metadata: {
        contestId: contestTitle
      }
    });
  } catch (error) {
    console.error('Error creating contest notification:', error);
    throw error;
  }
};

// Create system notification (for announcements)
exports.createSystemNotification = async (userId, title, message, priority = 'medium') => {
  try {
    return await Notification.createForUser(userId, {
      title,
      message,
      type: 'system',
      priority
    });
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
};

module.exports = exports;
