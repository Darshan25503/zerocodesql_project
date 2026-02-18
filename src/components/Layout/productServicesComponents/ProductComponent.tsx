import React from 'react';
import { CgLock, CgFileDocument, CgArrowsExchange, CgUserList, CgDatabase, CgClipboard, CgScreen, CgPlug } from 'react-icons/cg';

const services = [
  {
    title: 'Seamless Authentication',
    headline: 'Secure access to your data with ease. Log in, stay protected.',
    icon: <CgLock size={40} />,
  },
  {
    title: 'Interactive Datasheet',
    headline: 'Excel-like grid for your database. CRUD operations made simple.',
    icon: <CgFileDocument size={40} />,
  },
  {
    title: 'Effortless Data Transfer',
    headline: 'Import and export your data in various formats. Portability at its best.',
    icon: <CgArrowsExchange size={40} />,
  },
  {
    title: 'Robust Access Control',
    headline: 'Role-based permissions for enhanced security. Control who does what.',
    icon: <CgUserList size={40} />,
  },
  {
    title: 'Powerful API Generator',
    headline: 'Create RESTful APIs in no time. Seamless integration and development.',
    icon: <CgDatabase size={40} />,
  },
  {
    title: 'Dynamic Data Forms',
    headline: 'Custom forms for direct database entries. Simplify your data input.',
    icon: <CgClipboard size={40} />,
  },
  {
    title: 'Real-time Dashboard',
    headline: 'Visualize your data with real-time updates. Stay informed at a glance.',
    icon: <CgScreen size={40} />,
  },
  {
    title: 'Versatile Database Connectivity',
    headline: 'Connect to any relational database. Flexibility and compatibility guaranteed.',
    icon: <CgPlug size={40} />,
  },
];

const ProductComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="relative w-full h-64 mb-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <h1 className="text-7xl font-bold">Our Services</h1>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {services.map((service, index) => (
          <div
            key={index}
            className="relative p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition duration-500 ease-in-out group"
          >
            <div className="flex justify-center items-center mb-4">{service.icon}</div>
            <h2 className="text-xl font-semibold mb-2 text-center group-hover:text-blue-500 transition duration-500 ease-in-out">{service.title}</h2>
            <p className="text-center text-gray-400 group-hover:text-gray-200 transition duration-500 ease-in-out">{service.headline}</p>
            <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-500 transition duration-500 ease-in-out"></div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr;
          }
        }
        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 1280px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
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
};

export default ProductComponent;
