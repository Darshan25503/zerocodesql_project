"use client";

import { deleteCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { IoMdLogOut } from "react-icons/io";

export function SidebarLogout() {

  const router = useRouter();
  const handleLogOut = () => {
    deleteCookie("session-us");
    localStorage.setItem('incomingToast', 'Successfully logged out!');
    router.push('/auth/signin');
  }

  return <div className="flex py-1 px-2 mt-1 hover:bg-red-600 text-red-600 hover:text-white hover:rounded-md rounded-md cursor-pointer transition-colors duration-300" onClick={handleLogOut}>
    <div className='flex-2 pr-3 items-center flex'><IoMdLogOut /></div>
    <div className='flex-1 whitespace-nowrap'>Log Out</div>
  </div>
}