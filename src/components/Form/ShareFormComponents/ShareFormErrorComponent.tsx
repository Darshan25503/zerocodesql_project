import React from 'react';
import { BiSolidError } from 'react-icons/bi';

export default function ShareFormErrorComponent() {
  return (
    <div className='m-5'><center className='flex justify-center font-bold text-3xl'><BiSolidError color='red' size={35} className='mr-3' />Invalid Form</center>
      <br /><center>Unfortunately, the specified form does not exist in our database. Please double-check <br />
        the form name or contact support for further assistance. If you believe this is an error,<br /> try again later or ensure the correct form link is used.</center></div>
  )
}
