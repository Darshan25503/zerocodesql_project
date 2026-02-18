import React from 'react'
import { AiOutlineForm } from 'react-icons/ai';
import { IoCloseSharp } from "react-icons/io5";
import FormBuilder from './FormBuilder';
import FormDataDashBoard from './FormDataDashBoard';
import { cookies } from 'next/headers';
import prisma from '../../../../prisma/client';
import { Id } from '@/lib/manage/types';
import { User } from '@/lib/manage/user';
import { Form } from '@/lib/manage/form';

export default async function FormPage() {
  let sess = cookies().get('session-us')?.value;
  if (sess == null)
    return <></>
  let usr = await prisma.user.findFirst({
    where: {
      Session: {
        some: {
          sessionToken: sess
        }
      }
    }
  });
  let ds = await User.getAccessibleEntities(usr.id as Id<'User'>);
  let forms = await Form.listForms(usr.isSuperAdmin ? undefined : usr.id as Id<'User'>);

  return (
    <div>
      <FormBuilder schema={ds} id={usr.id} />
      <FormDataDashBoard schema={ds} forms={forms} />
    </div>
  )
}
