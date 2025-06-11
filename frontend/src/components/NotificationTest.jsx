import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationTestComponent = () => {
  const { 
    addNotification, 
    addProblemSolvedNotification, 
    addCourseEnrollmentNotification,
    addJobApplicationNotification 
  } = useNotifications();

  const handleAddGenericNotification = () => {
    addNotification({
      title: "Test Notification",
      message: "This is a test notification to demonstrate the system!",
      type: "test"
    });
  };

  const handleAddProblemSolved = () => {
    addProblemSolvedNotification("Binary Search");
  };

  const handleAddCourseEnrollment = () => {
    addCourseEnrollmentNotification("Advanced React Patterns");
  };

  const handleAddJobApplication = () => {
    addJobApplicationNotification("Senior Frontend Developer", "TechCorp Inc.");
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg max-w-md mx-auto mt-8">
      <h3 className="text-xl font-bold mb-4 text-green-400">Notification System Test</h3>
      <div className="space-y-3">
        <button
          onClick={handleAddGenericNotification}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Generic Notification
        </button>
        
        <button
          onClick={handleAddProblemSolved}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Problem Solved
        </button>
        
        <button
          onClick={handleAddCourseEnrollment}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Course Enrollment
        </button>
        
        <button
          onClick={handleAddJobApplication}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Add Job Application
        </button>
      </div>
      
      <p className="text-sm text-gray-400 mt-4">
        Click any button above to add a notification, then check the notification bell in the nav bar!
      </p>
    </div>
  );
};

export default NotificationTestComponent;
