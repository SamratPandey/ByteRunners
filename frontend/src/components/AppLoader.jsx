import React from 'react';

const AppLoader = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, 0.1) 25%, rgba(34, 197, 94, 0.1) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.1) 75%, rgba(34, 197, 94, 0.1) 76%, transparent 77%, transparent),
              linear-gradient(transparent 24%, rgba(34, 197, 94, 0.1) 25%, rgba(34, 197, 94, 0.1) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, 0.1) 75%, rgba(34, 197, 94, 0.1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* Floating code elements */}
        <div className="absolute top-20 left-20 text-green-400/30 font-mono text-lg animate-float">
          {'</>'}
        </div>
        <div className="absolute top-40 right-32 text-green-400/30 font-mono text-sm animate-float-delayed">
          function()
        </div>
        <div className="absolute bottom-32 left-40 text-green-400/30 font-mono text-lg animate-float">
          {'{}'}
        </div>
        <div className="absolute bottom-20 right-20 text-green-400/30 font-mono text-sm animate-float-delayed">
          console.log()
        </div>
      </div>

      {/* Main Loader Content */}
      <div className="relative z-10 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-green-400">Byte</span>Runners
          </h1>
          <p className="text-gray-400 text-sm">Loading your coding journey...</p>
        </div>

        {/* Loading Animation */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-green-400 rounded-full animate-spin"></div>
            
            {/* Inner pulsing dot */}
            <div className="absolute inset-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center space-x-1 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Code-like loading text */}
          <div className="font-mono text-sm text-gray-400">
            <div className="animate-pulse">
              <span className="text-green-400">if</span> (loading) {'{'} 
              <span className="ml-4 block text-gray-300">prepare_awesome_experience();</span>
              {'}'}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-8 w-64 mx-auto">
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div className="bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>      {/* Custom CSS */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-10px) rotate(5deg); opacity: 0.6; }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-15px) rotate(-5deg); opacity: 0.5; }
        }
        
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AppLoader;
