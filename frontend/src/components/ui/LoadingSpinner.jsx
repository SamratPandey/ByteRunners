import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Spinner */}
      <div className={`relative ${sizeClasses[size]}`}>
        <div className="absolute inset-0 border-2 border-gray-700 rounded-full"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-green-400 rounded-full animate-spin"></div>
      </div>
      
      {/* Message */}
      {message && (
        <p className="mt-3 text-sm text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
