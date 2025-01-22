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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import logo from "../assets/logo.png"

const Nav = () => {
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
    setIsLoggedIn(!!token);
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
      className={`transition-all duration-300 fixed top-0 left-0 w-full bg-black backdrop-blur-sm border-b border-green-900 py-4 px-8 md:px-12 z-50 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <Link to="/">
            <img src={logo} alt="" srcSet="" className='w-44'/>
          </Link>
        </div>

        <ul className="hidden min-[840px]:flex space-x-8 text-center absolute left-1/2 transform -translate-x-1/2">
          {navigationItems.map((item) => (
            <li key={item.label} className="cursor-pointer">
              <span 
                onClick={() => handleNavigation(item.path)}
                className="text-green-400 hover:text-green-600 transition-colors duration-200"
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="hidden min-[840px]:flex items-center space-x-6">
          <div className="search-container relative">
            <button
              onClick={toggleSearch}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
            
            {isSearchVisible && (
              <div className="absolute right-0 top-10 w-64 bg-black/95 border border-green-900 rounded-md p-2 shadow-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border border-green-900 text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="text-gray-400 hover:text-green-400 transition-colors duration-200">
            <FontAwesomeIcon icon={faBell} />
          </button>

          {!isLoggedIn ? (
            <Link to="/login">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-colors duration-200">
                Sign In
              </button>
            </Link>
          ) : (
            <div className="relative">
              <Avatar
                onClick={toggleAvatarDropdown}
                className="cursor-pointer ring-2 ring-green-500/50 hover:ring-green-500 transition-all duration-200"
              >
                <AvatarImage src="" alt="" />
                <AvatarFallback className="bg-green-600 text-white">CN</AvatarFallback>
              </Avatar>
              
              {isAvatarDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black/95 border border-green-900 text-gray-300">
                  {avatarMenuItems.map((item, index) => (
                    item.label === 'Logout' ? (
                      <button
                        key={index}
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-green-600/20 hover:text-green-400 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon icon={item.icon} className="text-green-500" />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    ) : (
                      <Link
                        key={index}
                        to={item.path}
                        className="block px-4 py-3 text-sm hover:bg-green-600/20 hover:text-green-400 transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <FontAwesomeIcon icon={item.icon} className="text-green-500" />
                          <span>{item.label}</span>
                        </div>
                      </Link>
                    )
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="min-[840px]:hidden flex items-center space-x-4">
          <div className="search-container relative">
            <button
              onClick={toggleSearch}
              className="text-gray-400 hover:text-green-400 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
            
            {isSearchVisible && (
              <div className="absolute right-0 top-10 w-64 bg-black/95 border border-green-900 rounded-md p-2 shadow-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black/50 border border-green-900 text-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 placeholder-gray-500"
                    autoFocus
                  />
                  <button
                    onClick={handleSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button className="text-gray-400 hover:text-green-400 transition-colors duration-200">
            <FontAwesomeIcon icon={faBell} />
          </button>
          
          <button
            onClick={toggleMenu}
            className="text-gray-300 hover:text-green-400 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} size="lg" />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="min-[840px]:hidden mt-4 bg-black/95 border border-green-900 rounded-md p-4">
          <ul className="space-y-4">
            {navigationItems.map((item) => (
              <li key={item.label} className="cursor-pointer">
                <span 
                  onClick={() => handleNavigation(item.path)}
                  className="text-gray-300 hover:text-green-400 transition-colors duration-200"
                >
                  {item.label}
                </span>
              </li>
            ))}
            {!isLoggedIn ? (
              <li>
                <Link to="/login">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md transition-colors duration-200">
                    Sign In
                  </button>
                </Link>
              </li>
            ) : (
              avatarMenuItems.map((item, index) => (
                <li key={index}>
                  {item.label === 'Logout' ? (
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-gray-300 hover:text-green-400 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={item.icon} className="text-green-500" />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className="block text-gray-300 hover:text-green-400 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={item.icon} className="text-green-500" />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Nav;