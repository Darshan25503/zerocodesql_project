import React from "react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';

interface SearchableSelectProps {
  options: { display: string; value: string | number }[];
  className?: string;
  contentStyleOverride?: CSSProperties;
  onValueChanged: (value: string | number) => void;
  value?: { display: string; value: string | number };
}

export const SearchableSelect = (props: SearchableSelectProps) => {
  const [currentSelection, setCurrentSelection] = useState(props.value ? props.value : props.options[0]);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [focusState, setFocusState] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [currentSlice, setCurrentSlice] = useState(props.options);
  const [open, setOpen] = useState(false);

  const setValue = (value: string | number) => {
    setCurrentSelection(props.options.find(option => option.value === value) ?? props.options[0]);
    props.onValueChanged(value);
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
    setOpen(false);
  };
  useEffect(() => {
    const curSlice = props.options.filter(option => 
      `${option.display}`.toLowerCase().includes(searchValue.toLowerCase())
    );
    setCurrentSlice(curSlice);
  }, [searchValue, props.options]);

  // Calculate the position of the dropdown
  const calculateDropdownPosition = () => {
    if (detailsRef.current) {
      const bbox = detailsRef.current.getBoundingClientRect();
      return {
        left: bbox.left,
        top: bbox.bottom + window.scrollY, // Position it below the dropdown
      };
    }
    return { left: 0, top: 0 };
  };

  const { left, top } = calculateDropdownPosition();

  const contentStyle: CSSProperties = {
    left: left,
    top: top,
    ...props.contentStyleOverride,
  };

  return (
    <>
      <details className='dropdown w-full' ref={detailsRef}>
        <summary className={`select ${props.className} w-full`} onClick={() => setOpen(!open)}>
          {currentSelection.display}
        </summary>
        {open && createPortal(
          <div className={`dropdown-content menu z-[1] w-full mt-2 bg-base-100 rounded-box p-2 shadow absolute`} style={contentStyle}>
            <div className="fixed w-[100vw] h-[100vh] top-0 right-0" onClick={() => { setOpen(false); }}></div>
            <label className="input input-bordered flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 opacity-70">
                <path
                  fillRule="evenodd"
                  d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                  clipRule="evenodd" />
              </svg>
              <input type="text" className="grow z-[2]" placeholder="Search" value={searchValue} onChange={e => setSearchValue(e.target.value)} />
            </label>
            <ul className="w-full block max-h-52 mt-2 z-[2] overflow-y-auto">
              {
                currentSlice.map(option => (
                  <li key={option.value}>
                    <a onClick={() => setValue(option.value)}>{option.display}</a>
                  </li>
                ))
              }
            </ul>
          </div>,
          document.body
        )}
      </details>
    </>
  );
};
