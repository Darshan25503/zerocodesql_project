import React, { useState } from 'react';
import Link from 'next/link';

const ProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    document.cookie = 'session-us=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // Optionally, you might want to redirect the user or update app state
    window.location.href = '/';
  };

  return (
    <div className="relative">
      <button
        className="flex items-center focus:outline-none align-middle"
        onClick={toggleDropdown}
        aria-label="Profile menu"
      >
        <div className="w-8 h-8 bg-gray-300 rounded-full align-middle"></div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-black rounded-lg shadow-lg z-10">
          <div className="py-1">
            <Link href="/profile">
              <div className="block px-4 py-2 text-white hover:bg-gray-800">
                Profile
              </div>
            </Link>
            <Link href="/dashboard/home">
              <div className="block px-4 py-2 text-white hover:bg-gray-800">
                Dashboard
              </div>
            </Link>
            <button
              className="block w-full px-4 py-2 text-left text-white hover:bg-gray-800"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
