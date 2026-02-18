"use client"

import { useState } from "react"
import { HiOutlineMenu } from "react-icons/hi";
import { SidebarBtn } from "./SidebarBtn";
import { AiOutlineDatabase } from "react-icons/ai";


export const SideNavBarContainer = ({ children, dataView }: { children: React.ReactNode, dataView: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex h-[100vh] bg-slate-200 text-black transition-width duration-300 ">
      <div className="flex flex-col w-full">
        <div className="flex items-center justify-between h-11 p-3 bg-slate-200 ">
          <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
            <HiOutlineMenu className={`w-5 h-5 transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`} />
          </button>
        </div>
        <div className={`${isOpen ? "w-64" : "w-10"} transform duration-300 text-ellipsis  overflow-hidden	 p-1 space-y-2 h-full flex flex-col`}>
          {children}
          {isOpen ? dataView :
            <div className="flex py-1 px-2 mt-1 hover:bg-gray-400 hover:rounded-md cursor-pointer" onClick={() => setIsOpen(true)}>
              <div className='flex-2 pt-1 pr-3'><AiOutlineDatabase /></div>
            </div>}
        </div>
      </div>
    </div>
  )
}