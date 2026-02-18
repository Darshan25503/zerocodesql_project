"use client"

import React from 'react';
import { FaDatabase, FaChartPie, FaCogs } from 'react-icons/fa';

const services = [
  {
    title: 'Seamless Authentication',
    headline: 'Secure access to your data with ease. Log in, stay protected.',
    icon: <FaDatabase size={40} />,
  },
  {
    title: 'Interactive Datasheet',
    headline: 'Excel-like grid for your database. CRUD operations made simple.',
    icon: <FaChartPie size={40} />,
  },
  {
    title: 'Effortless Data Transfer',
    headline: 'Import and export your data in various formats. Portability at its best.',
    icon: <FaCogs size={40} />,
  },
];

const advantages = [
  {
    title: 'Affordable Pricing',
    headline: 'Unlike Apache AirTable, ZeroCodeSQL offers a comprehensive suite of tools without subscription costs, making it ideal for small businesses and individual users.',
    icon: <FaDatabase size={40} />,
  },
  {
    title: 'Multi-Database Support',
    headline: 'ZeroCodeSQL can handle multiple databases simultaneously, overcoming the single data source limitation of NocoDB.',
    icon: <FaChartPie size={40} />,
  },
  {
    title: 'Cross-Database Relations',
    headline: 'Manage relationships across different databases seamlessly, a feature not available in Mathesar.',
    icon: <FaCogs size={40} />,
  },
  {
    title: 'Resource Efficiency',
    headline: 'ZeroCodeSQL is designed to be resource-efficient, avoiding the high hardware requirements of DashPress.',
    icon: <FaDatabase size={40} />,
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex flex-col items-center justify-center pb-10">
        <div className="relative w-full h-64 mb-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
          <div className="relative z-9 flex flex-col items-center justify-center h-full">
            <h1 className="text-7xl font-bold text-white">Welcome to ZeroCodeSQL</h1>
          </div>
        </div>
        <p className="text-2xl font-semibold text-center max-w-2xl animate-fade-in-delay">
          Seamlessly Visualize and Analyze Data Across All Databases with One Powerful Tool
        </p>
      </header>
      <main className="px-6 pb-8">
        <section className="text-center mb-8">
          <p className="text-lg max-w-3xl mx-auto mb-8 animate-fade-in-delay">
            Zerocode SQL is a comprehensive tool for effortless data visualization across all databases. It simplifies complex data analysis with intuitive visual interfaces, enabling users to gain insights without extensive coding. Ideal for professionals and businesses, Zerocode SQL enhances productivity and decision-making through seamless integration and powerful visualization capabilities.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-blue-600 font-semibold text-white py-2 px-5 rounded-full hover:bg-blue-700 transition duration-300">Documentation</button>
            <button className="bg-white font-semibold text-black py-2 px-5 rounded-full hover:bg-gray-300 transition duration-300">Get Started</button>
          </div>
        </section>
        <section className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 py-5 rounded-lg mb-5 animate-fade-in">
          <h2 className="text-5xl font-bold text-center mb-10">Why ZeroCodeSQL?</h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 ease-in-out group">
                <div className="flex justify-center items-center mb-4">{advantage.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-center group-hover:text-blue-500 transition duration-500 ease-in-out">{advantage.title}</h3>
                <p className="text-center text-gray-400 group-hover:text-gray-200 transition duration-500 ease-in-out">{advantage.headline}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-in-out;
        }
        .animate-fade-in-delay {
          animation: fadeIn 2s ease-in-out;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
        @keyframes gradient-x {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
