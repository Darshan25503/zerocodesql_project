import React from 'react'
import { BiSolidError } from 'react-icons/bi'
import { IoArrowBackCircle } from "react-icons/io5";

export default function InvalidFormEditingAccess() {
  return (
    <div className='ml-[40%] mt-[10%]'>
      <div className='w-60 bg-slate-100 p-5 border-4 rounded-md'><center className='flex justify-center font-bold text-2xl'><BiSolidError color='red' size={35} className='mr-1' />NO FORM</center>
        <br /><center>No such form exists<br />
          Redirect to Form Page<br /><br />
          <a href="/dashboard/form"><button className='flex text-lg'><IoArrowBackCircle size={20} className='mt-1 mr-1' />back</button></a>
        </center></div>
    </div>
  )
}
