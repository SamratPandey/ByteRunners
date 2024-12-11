import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark, faSearch, faBell, faCircleHalfStroke } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isHidden, setIsHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // Scroll Down: hide navbar
      setIsHidden(true);
    } else {
      // Scroll Up: show navbar
      setIsHidden(false);
    }
    setLastScrollY(window.scrollY); // Update last scroll position
  };

  useEffect(() => {
    // Check if the user is logged in by the presence of a token in localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // If token exists, user is logged in

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className={`transition-all fixed top-0 left-0 w-full bg-black text-white py-4 px-8 md:px-12 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-12">
          {/* Logo Section */}
          <div className="text-2xl font-bold text-green-500">
            <img src="/logo.png" alt="Logo" className="mr-4" />
          </div>

          {/* Menu Items */}
          <ul className="hidden md:flex space-x-12">
            <li className="cursor-pointer">
              <span className="text-white">PRACTICE</span>
            </li>
            <li className="cursor-pointer">
              <span className="text-white">JOB</span>
            </li>
            <li className="cursor-pointer">
              <span className="text-white">INTERVIEW</span>
            </li>
            <li className="cursor-pointer">
              <span className="text-white">COURSES</span>
            </li>
          </ul>

          {/* Hamburger Menu on Mobile */}
          <div className="md:hidden">
            <FontAwesomeIcon
              icon={isMenuOpen ? faXmark : faBars}
              className="cursor-pointer text-white"
              onClick={toggleMenu}
            />
          </div>
        </div>

        {/* Right Section: Search and Login */}
        <div className="flex items-center space-x-4">
          {/* Search Button */}
          <button className="text-white">
            <FontAwesomeIcon icon={faSearch} size="lg" />
          </button>
          <button className="text-white">
          <FontAwesomeIcon icon={faBell} size="lg" />
          </button>
          <button className="text-white">
            <FontAwesomeIcon icon={faCircleHalfStroke}  size='lg'/>

          </button>
          

          {/* Conditionally render Login button */}
          {!isLoggedIn && (
            <Link to="/login">
              <button className="bg-green-500 text-white px-6 py-2 rounded-md">
                SignIn
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Dropdown Menu for Mobile */}
      <ul
        className={`flex flex-col md:hidden list-none m-0 p-0 ${
          isMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <li className="my-4 cursor-pointer">
          <span className="text-green-500">PRACTICE</span>
        </li>
        <li className="my-4 cursor-pointer">
          <span className="text-green-500">JOB</span>
        </li>
        <li className="my-4 cursor-pointer">
          <span className="text-green-500">INTERVIEW</span>
        </li>
        <li className="my-4 cursor-pointer">
          <span className="text-green-500">COURSES</span>
        </li>
      </ul>
    </nav>
  );
};

export default Nav;
