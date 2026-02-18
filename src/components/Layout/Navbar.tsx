"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import ProfileDropdown from "./ProfileDropdown";
import { IoIosLogIn } from "react-icons/io";

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const token = getCookie('session-us');
    setIsLogin(!!token);
    setIsLoading(false);
  }, []);

  if (isLoading) return null;

  return (
    <nav className="bg-gray-900 border-gray-700">
      <div className="max-w-screen-3xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center p-2 rounded-lg focus:outline-none focus:ring-2 dark:text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
              aria-controls="navbar-dropdown"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                viewBox="0 0 17 14"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <path d="M1 1h15M1 7h15M1 13h15"></path>
              </svg>
            </button>
          </div>

          <div className="flex justify-center md:justify-start flex-grow">
            <a href="#" className="text-2xl font-semibold text-white">
              ZeroCodeSQL
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <ul className="flex items-center space-x-6">
              <li>
                <Link href="/" className="text-white hover:text-gray-300">Home</Link>
              </li>
              {/* <li>
                <div className="relative">
                <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdown"
                type="button"
                className= "block py-2 px-3  rounded  md:hover:bg-transparent md:border-0  md:p-0 text-white md:hover:text-slate-300 hover:bg-gray-700 hover:text-white md:dark:hover:bg-transparent inline-flex items-center"
                
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => {
                  setTimeout(() => {
                    setShowDropdown(false);
                  }, 150);
                }}
              >
                    Dropdown
                    <svg
                      className="w-2.5 h-2.5 ml-2"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 10 6"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 4 4 4-4"
                      />
                    </svg>
                  </button>
                  {showDropdown && (
                    <div className="z-10 divide-y divide-gray-200 rounded-lg shadow w-44 bg-black absolute">
                      <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                        <li>
                          <Link href="/dashboard" legacyBehavior>
                            <a className="block px-4 py-2 text-white hover:bg-gray-600">
                              Dashboard
                            </a>
                          </Link>
                        </li>
                        <li>
                          <Link href="#" legacyBehavior>
                            <a className="block px-4 py-2 text-white hover:bg-gray-600">
                              Your Page
                            </a>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </li> */}
              <li>
                <Link href="/productservices" className="text-white hover:text-gray-300">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-white hover:text-gray-300">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-white hover:text-gray-300">
                  Contact
                </Link>
              </li>
            </ul>
            <div>
              {isLogin ? (
                <ProfileDropdown />
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/auth/signin")}
                  className="bg-white text-black font-medium rounded-lg text-sm px-5 py-1 text-center"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <div className="ml-auto">
              {isLogin ? (
                <ProfileDropdown />
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/auth/signin")}
                  className="bg-white text-black font-medium rounded-lg text-sm px-5 py-1 text-center"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>

        <div
          className={`md:hidden ${isMenuOpen ? "block" : "hidden"} pb-4`}
          id="navbar-dropdown"
        >
          <ul className="flex flex-col font-medium p-4 border rounded-lg bg-gray-800 border-gray-700">
            <li>
              <Link href="#"
                className="block py-2 px-3 text-white rounded bg-slate-400"
                aria-current="page">
                Home
              </Link>
            </li>
            {/* <li>
            <button
                id="dropdownDefaultButton"
                data-dropdown-toggle="dropdown"
                type="button"
                className= "block py-2 px-3  rounded  md:hover:bg-black md:border-0  md:p-0 text-white md:hover:text-slate-300 hover:bg-black hover:text-white md:dark:hover:bg-black inline-flex items-center"          
                onClick={() => setShowDropdown(!showDropdown)}
                onBlur={() => {
                  setTimeout(() => {
                    setShowDropdown(false);
                  }, 150);
                }}
              >
                Dropdown
                <svg
                  className="w-2.5 h-2.5 ml-2"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 10 6"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 4 4 4-4"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="z-10 divide-y divide-black rounded-lg shadow-lg w-44 bg-black absolute my-3 mx-3">
                  <ul className="py-2 text-sm text-white dark:text-white">
                    <li>
                      <Link href="/dashboard" legacyBehavior>
                        <a className="block px-4 py-2 text-white hover:bg-gray-600">
                          Dashboard
                        </a>
                      </Link>
                    </li>
                    <li>
                      <Link href="#" legacyBehavior>
                        <a className="block px-4 py-2 text-white hover:bg-gray-600">
                          Your Page
                        </a>
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li> */}
            <li>
              <Link href="/productservices" className="block py-2 px-3 rounded text-white hover:bg-gray-700">
                Services
              </Link>
            </li>
            <li>
              <Link href="/pricing" className="block py-2 px-3 rounded text-white hover:bg-gray-700">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/contact" className="block py-2 px-3 rounded text-white hover:bg-gray-700">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
export {}