import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, 
  faXmark, 
  faSearch, 
  faBell, 
  faUser,
  faTrophy,
  faBook,
  faSignOut
} from '@fortawesome/free-solid-svg-icons';
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Nav = (props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAvatarDropdownOpen, setIsAvatarDropdownOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const navigate = useNavigate();

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

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
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
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log(`Searching for: ${searchQuery}`);
    }
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest('.search-container')) {
      setIsSearchVisible(false);
    }
    setIsAvatarDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.reload();
    navigate('/');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if(token){
      setIsLoggedIn(true);
    }else{
      setIsLoggedIn(false);
    }
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [lastScrollY]);

  const avatarMenuItems = [
    { icon: faUser, label: 'My Profile', path: '/profile' },
    { icon: faTrophy, label: 'Leaderboard', path: '/leaderboard' },
    { icon: faBook, label: 'My Courses', path: '/my-courses' },
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
        </ul>

        {/* Desktop Actions */}
        <div className="hidden min-[840px]:flex items-center space-x-6">
          <div className="search-container relative">
            <button
              onClick={toggleSearch}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-2 rounded-full hover:bg-green-900/30"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
            
            {isSearchVisible && (
              <div className="absolute right-0 top-12 w-72 bg-black/95 border border-green-800/70 rounded-lg p-3 shadow-lg shadow-green-900/20">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-green-800 text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                    aria-label="Submit search"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            className="text-gray-400 hover:text-green-400 transition-colors duration-200 relative p-2 rounded-full hover:bg-green-900/30"
            aria-label="Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
          
          </button>

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
                    <p className="font-medium text-green-400">User Name</p>
                    <p className="text-xs text-gray-400">user@example.com</p>
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
                          className="block px-4 py-2 text-sm hover:bg-green-900/40 hover:text-green-300 transition-colors duration-200 flex items-center space-x-3"
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
        </div>

        {/* Mobile Actions */}
        <div className="min-[840px]:hidden flex items-center space-x-4">
          <div className="search-container relative">
            <button
              onClick={toggleSearch}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200 p-2 rounded-full hover:bg-green-900/30"
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
            
            {isSearchVisible && (
              <div className="absolute right-0 top-12 w-64 bg-black/95 border border-green-800/70 rounded-lg p-3 shadow-lg shadow-green-900/20">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/60 border border-green-800 text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                    aria-label="Submit search"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button 
            className="text-gray-400 hover:text-green-400 transition-colors duration-200 relative p-2 rounded-full hover:bg-green-900/30"
            aria-label="Notifications"
          >
            <FontAwesomeIcon icon={faBell} />
            <Badge className="absolute -top-1 -right-1 bg-green-500 text-black text-xs h-4 min-w-4 flex items-center justify-center p-0">
              2
            </Badge>
          </button>
          
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
            <li className="pt-2 border-t border-green-800/50">
              {!isLoggedIn ? (
                <Link to="/login">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md shadow-green-900/20">
                    Sign In
                  </button>
                </Link>
              ) : (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-3 px-1 py-2">
                    <div className="rounded-full p-2 bg-green-800/30 ring-2 ring-green-500/50">
                      <User className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-green-400">User Name</p>
                      <p className="text-xs text-gray-400">user@example.com</p>
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