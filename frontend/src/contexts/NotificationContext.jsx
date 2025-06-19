import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import notificationService from '../utils/notificationApi';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications({ 
        limit: 50,  // Get more notifications
        page: 1 
      });
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }    } catch (err) {
      setError('Failed to load notifications');
      // Fallback to dummy data for demo
      setDummyNotifications();
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);    } catch (err) {
      // Silent error handling
    }
  };

  // Fallback dummy data for demo purposes
  const setDummyNotifications = () => {
    const dummyNotifications = [
      {
        id: 1,
        title: "New Course Available",
        message: "JavaScript Advanced Course is now available!",
        time: "2 hours ago",
        type: "course",
        read: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: "Contest Reminder",
        message: "Weekly coding contest starts in 1 hour",
        time: "1 hour ago",
        type: "contest",
        read: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: "Problem Solved",
        message: "Congratulations! You solved 'Two Sum' problem",
        time: "1 day ago",
        type: "achievement",
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 4,
        title: "New Job Posting",
        message: "Software Engineer position at TechCorp",
        time: "2 days ago",
        type: "job",
        read: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
    
    setNotifications(dummyNotifications);
    setUnreadCount(dummyNotifications.filter(n => !n.read).length);
  };
  const addNotification = async (notification) => {
    // For demo purposes, add locally first
    const newNotification = {
      ...notification,
      id: Date.now(),
      read: false,
      createdAt: new Date(),
      time: 'Just now'
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // In production, you would also send to API:    // Note: API integration for creating notifications can be added here
  };

  const markAsRead = async (notificationId) => {
    try {
      // Update API first
      if (isAuthenticated) {
        await notificationService.markAsRead(notificationId);
      }
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }    } catch (error) {
      // Still update locally even if API fails
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update API first
      if (isAuthenticated) {
        await notificationService.markAllAsRead();
      }
      
      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);    } catch (error) {
      // Still update locally even if API fails
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Update API first
      if (isAuthenticated) {
        await notificationService.deleteNotification(notificationId);
      }
      
      // Update local state
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
      
      // Update unread count if deleted notification was unread
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }    } catch (error) {
      // Still update locally even if API fails
      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      );
    }
  };

  const getUnreadCount = () => {
    return unreadCount;
  };

  // Refresh notifications (useful for real-time updates)
  const refreshNotifications = async () => {
    if (isAuthenticated) {
      await fetchNotifications();
    }
  };

  // Example of adding notifications programmatically
  const addProblemSolvedNotification = (problemTitle) => {
    addNotification({
      title: "Problem Solved!",
      message: `Congratulations! You solved '${problemTitle}' problem`,
      type: "achievement"
    });
  };

  const addCourseEnrollmentNotification = (courseName) => {
    addNotification({
      title: "Course Enrolled",
      message: `You have successfully enrolled in ${courseName}`,
      type: "course"
    });
  };

  const addJobApplicationNotification = (jobTitle, company) => {
    addNotification({
      title: "Job Application Submitted",
      message: `Your application for ${jobTitle} at ${company} has been submitted`,
      type: "job"
    });
  };
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    refreshNotifications,
    // Helper functions for demo
    addProblemSolvedNotification,
    addCourseEnrollmentNotification,
    addJobApplicationNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
