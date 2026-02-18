import { SearchableSelect } from "@/components/General/SearchableSelect";
import React, { MutableRefObject, Ref } from "react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from 'react-dom';
import styles from "./EditCellRenderer.module.css";

interface FilterMenuProps {
  headerRef: MutableRefObject<HTMLDivElement>;
  open: boolean;
  setOpen: (open: boolean) => void;
  operators: { operator: string, display: string }[];
  fkeyValues: { id: number; display: string }[];
  type: string;
  filterData: () => FilterData;
  setFilterData: (kind: "operator" | "value" | "sort", value: string | number | { id: number; display: string }) => void;
  onApplyFilter: () => void;
}

interface FilterData {
  operator: string;
  filterValue: string | number | { id: number; display: string };
  sort: number;
}

export const FilterMenu = (props: FilterMenuProps) => {
  // Calculate the position of the dropdown
  const calculateDropdownPosition = () => {
    if (props.headerRef.current) {
      const bbox = props.headerRef.current.getBoundingClientRect();
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
  };

  const usesFkey = props.fkeyValues != null;
  const filterData = props.filterData();

  return (
    <>
      {props.open && createPortal(
        <div className={`dropdown-content menu z-[1] mt-2 bg-base-100 rounded-box p-2 shadow absolute`} style={contentStyle}>
          <div className="fixed w-[100vw] h-[100vh] top-0 right-0" onClick={() => { props.setOpen(false); }}></div>
          <div className="z-[2] flex flex-col gap-2">
            <select className="select select-bordered w-full max-w-xs" value={filterData.operator} onChange={(e) => { props.setFilterData("operator", e.target.value) }}>
              {props.operators.map((operator, index) => {
                return (
                  <option key={index} value={operator.operator}>
                    {operator.display}
                  </option>
                )
              })}
            </select>
            {
              usesFkey &&
              <SearchableSelect
                value={{ value: (filterData.filterValue as { id: number, display: string }).id, display: (filterData.filterValue as { id: number, display: string }).display }}
                onValueChanged={(v) => { props.setFilterData("value", v) }}
                contentStyleOverride={{ width: "unset", color: "black", fontFamily: "inherit", fontSize: "var(--rdg-font-size)" }}
                className={styles["rdg-fkey-dropdown-editor"]}
                options={props.fkeyValues.map((v) => { return { value: v.id, display: `${v.display} (${v.id})` } })}
              />
            }
            {
              !usesFkey && <input className="input input-bordered w-full max-w-xs"
                type={props.type}
                value={filterData.filterValue as string | number}
                onChange={(e) => { props.setFilterData("value", e.target.value) }}
              ></input>
            }
            <div className="btn w-full max-w-xs" onClick={() => { props.setOpen(false); props.onApplyFilter(); }}>Save</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
