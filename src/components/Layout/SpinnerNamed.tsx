import React from 'react'

function SpinnerNamed(props: { name: string }) {
  return (
    <>{props.name}
      <div
        className="inline-block h-4 w-4 ml-3 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
        role="status">
        <span
          className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
        ></span>
      </div>
    </>
  )
}

export default SpinnerNamed