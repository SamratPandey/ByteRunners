import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faXmark, 
  faBell, 
  faUser,
  faTrophy,
  faBook,
  faBriefcase,
  faSignOut,
  faBrain,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { User } from "lucide-react";
import { Button } from '@/components/ui/button';
import { logout } from '../redux/actions/authActions';
import { useNotifications } from '../contexts/NotificationContext';

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);  const [isNotificationOpen, setIsNotificationOpen] = useState(false);  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loading, 
    error,
    refreshNotifications 
  } = useNotifications();

  const navigationItems = [
    { label: 'PROBLEMS', path: '/problems' },
    { label: 'JOB', path: '/job' },
    { label: 'INTERVIEW', path: '/interview' },
    { label: 'COURSES', path: '/courses' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsAvatarDropdownOpen(false);
  };
  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleAvatarDropdown = (e) => {
    e.stopPropagation();
    setIsAvatarDropdownOpen(!isAvatarDropdownOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    setLastScrollY(window.scrollY);
  };  const handleClickOutside = (e) => {
    if (!e.target.closest('.notification-container')) {
      setIsNotificationOpen(false);
    }
    setIsAvatarDropdownOpen(false);
  };
  const handleLogout = () => {
    dispatch(logout());
    setIsLoggedIn(false);
    navigate('/');
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate to relevant page based on notification type
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      // Default navigation based on type
      switch (notification.type) {
        case 'achievement':
          navigate('/problems');
          break;
        case 'course':
          navigate('/courses');
          break;
        case 'job':
          navigate('/job');
          break;
        case 'contest':
          navigate('/problems'); // or contests page when available
          break;
        default:
          // Don't navigate for unknown types
          break;
      }
    }
    
    // Close notification dropdown
    setIsNotificationOpen(false);
  };

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [lastScrollY, isAuthenticated]);  const avatarMenuItems = [
    { icon: faUser, label: 'My Profile', path: '/profile' },
    { icon: faTrophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: faBook, label: 'My Courses', path: '/my-courses' },
    { icon: faBriefcase, label: 'My Applications', path: '/my-applications' },
    { icon: faBrain, label: 'AI Test', path: '/ai-test' },
    { icon: faChartLine, label: 'Test Analytics', path: '/test-analytics' },
    { icon: faSignOut, label: 'Logout'},
  ];

  return (
    <nav
      className={`transition-all duration-300 fixed top-0 left-0 w-full bg-black/90 backdrop-blur-md border-b border-green-800/70 py-3 px-4 md:px-8 lg:px-12 z-50 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex-shrink-0">
            <img src="/images/logo.png" alt="Logo" className="w-36 md:w-44 h-auto" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden min-[840px]:flex space-x-10 text-center">
          {navigationItems.map((item) => (
            <li key={item.label} className="cursor-pointer">
              <span 
                onClick={() => handleNavigation(item.path)}
                className="text-green-400 hover:text-green-300 transition-colors duration-200 text-sm font-medium tracking-wider"
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>        {/* Desktop Actions */}
        <div className="hidden min-[840px]:flex items-center space-x-6">
          <div className="notification-container relative">
            <button
              onClick={toggleNotification}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-2 rounded-full hover:bg-green-900/30 relative"
              aria-label="Notifications"
            >              <FontAwesomeIcon icon={faBell} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 top-12 w-80 bg-black/95 border border-green-800/70 rounded-lg shadow-lg shadow-green-900/20 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-green-800/70">
                  <h3 className="text-green-400 font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-400">{unreadCount} unread notifications</p>
                  )}
                </div>                <div className="py-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b border-green-800/30 hover:bg-green-900/20 transition-colors duration-200 cursor-pointer ${
                          !notification.read ? 'bg-green-900/10' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-green-400' : 'text-gray-300'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      <p>No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-green-800/70 text-center">
                  <button 
                    onClick={markAllAsRead}
                    className="text-green-400 hover:text-green-300 text-sm font-medium mr-4"
                  >
                    Mark All Read
                  </button>
                  <button className="text-green-400 hover:text-green-300 text-sm font-medium">
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <Link to="/login">
              <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 text-sm shadow-md shadow-green-900/20 hover:shadow-lg hover:shadow-green-900/30">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="relative z-10">
              <div
                onClick={toggleAvatarDropdown}
                className="cursor-pointer rounded-full p-2 ring-2 ring-green-500/50 hover:ring-green-500 hover:bg-green-800/50 flex items-center justify-center transition-all duration-200"
              >
                <User className="h-5 w-5 text-green-500" />
              </div>
                {isAvatarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg bg-black/95 border border-green-800 text-gray-300 overflow-hidden">
                  <div className="py-3 px-4 border-b border-green-800/70">
                    <p className="font-medium text-green-400">{user?.name || user?.username || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    {avatarMenuItems.map((item, index) => (
                      item.label === 'Logout' ? (
                        <button
                          key={index}
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-green-900/40 hover:text-green-300 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <FontAwesomeIcon icon={item.icon} className="text-green-500 w-4" />
                          <span>{item.label}</span>
                        </button>
                      ) : (
                        <Link
                          key={index}
                          to={item.path}
                          className="px-4 py-2 text-sm hover:bg-green-900/40 hover:text-green-300 transition-colors duration-200 flex items-center space-x-3"
                        >
                          <FontAwesomeIcon icon={item.icon} className="text-green-500 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>        {/* Mobile Actions */}
        <div className="min-[840px]:hidden flex items-center space-x-4">
          <div className="notification-container relative">
            <button
              onClick={toggleNotification}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-2 rounded-full hover:bg-green-900/30 relative"
              aria-label="Notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            {isNotificationOpen && (
              <div className="absolute right-0 top-12 w-72 bg-black/95 border border-green-800/70 rounded-lg shadow-lg shadow-green-900/20 max-h-80 overflow-y-auto z-50">
                <div className="p-3 border-b border-green-800/70">
                  <h3 className="text-green-400 font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-400">{unreadCount} unread</p>
                  )}
                </div>                <div className="py-1">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-3 border-b border-green-800/30 hover:bg-green-900/20 transition-colors duration-200 cursor-pointer ${
                          !notification.read ? 'bg-green-900/10' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`text-xs font-medium ${!notification.read ? 'text-green-400' : 'text-gray-300'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-1 ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-400">
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                <div className="p-2 border-t border-green-800/70 text-center">
                  <button 
                    onClick={markAllAsRead}
                    className="text-green-400 hover:text-green-300 text-xs font-medium mr-3"
                  >
                    Mark All Read
                  </button>
                  <button className="text-green-400 hover:text-green-300 text-xs font-medium">
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={toggleMenu}
            className="text-gray-300 hover:text-green-400 transition-colors duration-200 p-2 rounded-full hover:bg-green-900/30"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} size="lg" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="min-[840px]:hidden mt-4 bg-black/95 border border-green-800/70 rounded-lg p-4 mx-2 shadow-lg shadow-green-900/20 overflow-hidden">
          <ul className="space-y-3">
            {navigationItems.map((item) => (
              <li key={item.label} className="cursor-pointer">
                <span 
                  onClick={() => handleNavigation(item.path)}
                  className="text-gray-300 hover:text-green-400 transition-colors duration-200 block py-2 font-medium"
                >
                  {item.label}
                </span>
              </li>
            ))}
            <li className="pt-2 border-t border-green-800/50">              {!isLoggedIn ? (
                <Link to="/login">
                  <Button 
                    className="w-full font-medium shadow-md" 
                    size="lg"
                    variant="success"
                  >
                    Sign In
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3 pt-2">                  <div className="flex items-center space-x-3 px-1 py-2">
                    <div className="rounded-full p-2 bg-green-800/30 ring-2 ring-green-500/50">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-green-400">{user?.name || user?.username || 'User'}</p>
                      <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                    </div>
                  </div>
                  {avatarMenuItems.map((item, index) => (
                    <div key={index}>
                      {item.label === 'Logout' ? (
                        <button
                          onClick={handleLogout}
                          className="w-full text-left py-2 px-1 text-gray-300 hover:text-green-400 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <FontAwesomeIcon icon={item.icon} className="text-green-500 w-4" />
                            <span>{item.label}</span>
                          </div>
                        </button>
                      ) : (
                        <Link
                          to={item.path}
                          className="block py-2 px-1 text-gray-300 hover:text-green-400 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <FontAwesomeIcon icon={item.icon} className="text-green-500 w-4" />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;