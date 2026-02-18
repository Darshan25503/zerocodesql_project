import React from 'react'

interface deleteprop {
  name: string,
  type: string
}

export default function DeletePopupMessage(prop: deleteprop) {
  return (
    <div>
      <div className='my-9 mx-3'>Are you sure you want to delete <b>{prop.name}</b>? This action cannot be undone.</div>
    </div>
  )
}
