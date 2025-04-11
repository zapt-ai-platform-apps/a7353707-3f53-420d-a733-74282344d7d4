import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="flex items-center">
              <img 
                src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=32&height=32" 
                alt="HealthScan" 
                className="h-6 w-6 mr-2" 
              />
              <span className="font-medium text-gray-900">HealthScan</span>
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Helping you make healthier choices
            </p>
          </div>
          
          <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                Product
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/scan" className="text-sm text-gray-500 hover:text-gray-900">
                    Scan Product
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-gray-500 hover:text-gray-900">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                Account
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/login" className="text-sm text-gray-500 hover:text-gray-900">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-gray-500 hover:text-gray-900">
                    Sign up
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-500 text-center">
            &copy; {currentYear} HealthScan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;