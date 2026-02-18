"use client";
import { MdAddLink } from "react-icons/md"
import { ApiBuilderForm } from "./ApiBuilderForm"
import { AsyncReturnType } from "@/lib/database/types"
import { User } from "@/lib/manage/user"
import { useRef } from "react";

interface ApiBuilderContainerProps {
  schema: AsyncReturnType<typeof User.getAccessibleEntities>
}

export const ApiBuilderFormPopupContainer = (props: ApiBuilderContainerProps) => {

  const dialogRef = useRef(null);

  return <>
    <button className='relative flex flex-col m-6 text-gray-700 bg-gray-200 shadow-md hover:shadow-xl transition 300 bg-clip-border rounded-xl w-60' onClick={() => dialogRef.current.showModal()}>
      <div><MdAddLink size="30" className='ml-4 mt-4' /></div>
      <p className='m-4 text-m '>Add New API</p>
    </button>
    <ApiBuilderForm schema={props.schema} ref={dialogRef} editing={false} />
  </>
}