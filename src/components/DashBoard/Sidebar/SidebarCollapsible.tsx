import Link from 'next/link';
import React, { useState } from 'react';

interface SidebarCollapsibleProps {
  display: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  link?: string;
}

export const SidebarCollapsible: React.FC<SidebarCollapsibleProps> = (props) => {
  const el = <li>
    {props.children ?
      <details>
        <summary>{props.icon} {props.display}</summary>
        <ul>
          {props.children}
        </ul>
      </details>
      : <div className='text-wrap w-40'>
        {props.icon} <p className='break-words overflow-hidden'>{props.display}</p>
      </div>}
  </li>

  if (props.link !== undefined) {
    return <Link href={props.link}>{el}</Link>
  }
  else
    return el;
}