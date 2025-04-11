import React from 'react';
import { Link } from 'react-router-dom';
import { FiCamera, FiDatabase, FiShield, FiAward } from 'react-icons/fi';
import Button from '@/modules/core/components/Button';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left max-w-lg mx-auto lg:mx-0">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Analyze Product Ingredients for Better Health
              </h1>
              <p className="text-lg md:text-xl text-primary-100 mb-8">
                Scan product ingredients and get instant analysis of their health impact. Make informed decisions about the products you use daily.
              </p>
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/scan">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    className="bg-white text-primary-600 hover:bg-primary-50"
                    icon={<FiCamera />}
                  >
                    Scan a Product
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white text-white hover:bg-primary-700"
                  >
                    Create an Account
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <img 
                src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=512&height=512" 
                alt="Product Analysis" 
                className="h-56 lg:h-72 w-auto"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white transform -skew-y-2 origin-left -mb-10"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 mt-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              HealthScan uses advanced AI to analyze product ingredients and provide detailed insights about their potential health impacts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                <FiCamera className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Scan or Upload</h3>
              <p className="text-gray-600">
                Use your camera to scan product ingredients or upload a picture from your gallery. You can also manually enter ingredients.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                <FiDatabase className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes each ingredient for potential health concerns, allergens, irritants, and environmental impact.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mb-4">
                <FiAward className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">
                Receive a detailed breakdown of ingredients, an overall safety rating, and recommendations for healthier alternatives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Why Choose HealthScan</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              Make informed decisions about the products you use every day
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <FiShield className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Advanced Analysis</h3>
                <p className="mt-2 text-gray-600">
                  Get detailed information about each ingredient, including potential health risks, allergenic properties, and environmental impact.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Free Analysis</h3>
                <p className="mt-2 text-gray-600">
                  Analyze up to 5 products per day without an account, or create an account to analyze up to 50 products daily.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Educational Content</h3>
                <p className="mt-2 text-gray-600">
                  Access our blog for in-depth articles about ingredients, healthy living, and making better product choices.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Scan History</h3>
                <p className="mt-2 text-gray-600">
                  Create an account to save your scan history and easily reference previous product analyses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:py-16 md:px-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Ready to make healthier choices?
              </h2>
              <p className="text-lg text-primary-100 mb-8 max-w-3xl mx-auto">
                Start scanning product ingredients today and discover what's really in the products you use.
              </p>
              <Link to="/scan">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="bg-white text-primary-600 hover:bg-primary-50"
                  icon={<FiCamera />}
                >
                  Scan Your First Product
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;