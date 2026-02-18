"use client";
import { useRouter } from "next/navigation";
import React from "react";

export function SidebarBtn({ icon, text, clickLink }: { icon: React.ReactNode, text: string, clickLink: string }) {
  const router = useRouter();

  return (<div className="flex py-1 px-2 mt-1 hover:bg-gray-400 hover:rounded-md cursor-pointer transition-colors duration-300" onClick={() => router.push(clickLink)}>
    <div className='flex-2 pt-1 pr-3'>{icon}</div>
    <div className='flex-1'>{text}</div>
  </div>)
}