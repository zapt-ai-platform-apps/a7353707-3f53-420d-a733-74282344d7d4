import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiCamera, FiHome, FiBook, FiClock } from 'react-icons/fi';

const Header = () => {
  const { user, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navItems = [
    { path: '/', label: 'Home', icon: <FiHome className="mr-2" /> },
    { path: '/scan', label: 'Scan Product', icon: <FiCamera className="mr-2" /> },
    { path: '/blog', label: 'Blog', icon: <FiBook className="mr-2" /> }
  ];

  const userNavItems = [
    { path: '/profile', label: 'My Profile', icon: <FiUser className="mr-2" /> },
    { path: '/history', label: 'Scan History', icon: <FiClock className="mr-2" /> }
  ];

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={closeMenu}>
              <img 
                src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=32&height=32" 
                alt="HealthScan" 
                className="h-8 w-8 mr-2" 
              />
              <span className="font-bold text-xl text-primary-600">HealthScan</span>
            </Link>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`${
                    isActive(item.path)
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Desktop user menu */}
          <div className="hidden md:ml-6 md:flex md:items-center">
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative ml-3 flex items-center">
                    <div className="flex items-center space-x-4">
                      {userNavItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`${
                            isActive(item.path)
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          } px-3 py-2 rounded-md text-sm font-medium`}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium flex items-center cursor-pointer"
                      >
                        <FiLogOut className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <FiMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium flex items-center`}
                onClick={closeMenu}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
          
          {!isLoading && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                    Signed in as <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 flex items-center"
                        onClick={closeMenu}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 flex items-center cursor-pointer"
                    >
                      <FiLogOut className="mr-2" />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 space-y-1">
                  <Link
                    to="/login"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                    onClick={closeMenu}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:bg-gray-50 hover:border-gray-300 hover:text-primary-700"
                    onClick={closeMenu}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;