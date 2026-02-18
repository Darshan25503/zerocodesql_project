import React from 'react'
interface Props {
  title: string,
  description: string,
}
const DialogBoxHeader = (props: Props) => {
  return (
    <div>
      <div className="sticky top-0 bg-white p-4 mb-1 border-b border-gray-200 z-10">
        <h2 className='font-bold text-lg mb-1'>{props.title}</h2>
        <p className='text-sm mb-1 text-justify'>{props.description}</p>
      </div>
    </div>
  )
}
export default DialogBoxHeader;