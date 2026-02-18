import ShareFormComponent from '@/components/Form/ShareFormComponents/ShareFormComponent';
import React, { useState } from 'react';
import { headers } from 'next/headers';
import { Form } from '@/lib/manage/form';
import ShareFormErrorComponent from '@/components/Form/ShareFormComponents/ShareFormErrorComponent';
import { User } from '@/lib/manage/user';

export default async function page({ params: { sharestring } }: { params: { sharestring: string } }) {
  let formSch = await Form.getFormFromLink(sharestring);
  let viewState = await Form.getFormViewState(formSch?.id);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-3/5 mx-36 mt-14 mb-14 bg-gray-100 shadow-2xl rounded-lg overflow-hidden">
        <div className=' h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-center font-bold text-white pt-3 text-5xl'>ZeroCodeSQL</div>
        {
          formSch?.enabled ? <ShareFormComponent viewState={viewState} /> : <ShareFormErrorComponent />
        }
      </div>
    </div>
  )
}

