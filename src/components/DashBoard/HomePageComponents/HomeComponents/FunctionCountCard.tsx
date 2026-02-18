import React from 'react';
import { IconType } from 'react-icons';
import { SiGoogleforms } from "react-icons/si";
import { AiFillApi } from "react-icons/ai";

interface DataSourceButtonProps {
  icon: IconType;
  title: string;
  amount: string;
}

const FunctionCountCard: React.FC<DataSourceButtonProps> = ({ icon: Icon, title, amount }) => {
  return (
    <div className="flex items-center justify-between md:mx-1 sm:ml-1 mb-1 p-4 text-gray-700 bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-102">
      <div className='py-2'>
        <p className="text-gray-500 text-xs sm:text-sm mb-3 md:text-base">{title}</p>
        <h2 className="text-gray-800 text-xl sm:text-2xl md:text-3xl font-bold">{amount}</h2>
      </div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16  rounded-full flex items-center justify-center">
        <Icon size="24" className="sm:size-30 md:size-36" />
      </div>
    </div>
  );
};

export default FunctionCountCard;
