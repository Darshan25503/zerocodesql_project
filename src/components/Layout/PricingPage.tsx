import React from 'react';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-[-1] bg-gray-800 opacity-60" />
      <div className="max-w-7xl w-full text-center">
        <h2 className="text-7xl font-bold mb-8">Our Pricing Plans</h2>
        <p className="text-lg text-gray-300 mb-12">Choose the plan that suits your needs and take your business to the next level.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="relative bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-transform duration-500 ease-in-out transform hover:shadow-2xl hover:bg-gradient-to-r hover:from-green-500 hover:to-green-600">
            <div className="width-full absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-2xl mt-2"></div>
            <h3 className="text-2xl font-bold mb-4 text-white">Free Plan</h3>
            {/* <p className="text-xl font-semibold line-through text-white">$0.00</p> */}
            <p className="text-4xl font-bold mb-4 text-white">Free</p>
            <ul className="text-left mb-8 space-y-2 text-gray-300">
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Seamless Authentication</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Interactive Datasheet</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Effortless Data Transfer</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Robust Access Control</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Powerful API Generator</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Dynamic Data Forms</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Real-time Dashboard</li>
              <li className="flex items-center"><span className="text-green-400 mr-2">&#10003;</span>Versatile Database Connectivity</li>
            </ul>
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-transform duration-300 transform">Get Started</button>
          </div>

          {/* Standard Plan */}
          <div className="relative bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-transform duration-500 ease-in-out transform hover:shadow-2xl hover:bg-gradient-to-r hover:from-yellow-500 hover:to-yellow-600">
            <div className="width-full absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-red-500 rounded-t-2xl mt-2"></div>
            <h3 className="text-2xl font-bold mb-4 text-white">Standard Plan</h3>
            <p className="text-xl font-semibold line-through text-white">$4.99</p>
            <p className="text-4xl font-bold mb-4 text-white">Free</p>
            <ul className="text-left mb-8 space-y-2 text-gray-300">
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Seamless Authentication</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Interactive Datasheet</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Effortless Data Transfer</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Robust Access Control</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Powerful API Generator</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Dynamic Data Forms</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Real-time Dashboard</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Versatile Database Connectivity</li>
              <li className="flex items-center"><span className="text-yellow-400 mr-2">&#10003;</span>Priority Support</li>
            </ul>
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-transform duration-300 transform">Get Started</button>
          </div>

          {/* Premium Plan */}
          <div className="relative bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-transform duration-500 ease-in-out transform hover:shadow-2xl hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-600">
            <div className="width-full absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-2xl mt-2"></div>
            <h3 className="text-2xl font-bold mb-4 text-white">Premium Plan</h3>
            <p className="text-xl font-semibold line-through text-white">$9.99</p>
            <p className="text-4xl font-bold mb-4 text-white">Free</p>
            <ul className="text-left mb-8 space-y-2 text-gray-300">
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Seamless Authentication</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Interactive Datasheet</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Effortless Data Transfer</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Robust Access Control</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Powerful API Generator</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Dynamic Data Forms</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Real-time Dashboard</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Versatile Database Connectivity</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Priority Support</li>
              <li className="flex items-center"><span className="text-blue-400 mr-2">&#10003;</span>Dedicated Account Manager</li>
            </ul>
            <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-2 px-4 rounded-full shadow-lg transition-transform duration-300 transform">Get Started</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
