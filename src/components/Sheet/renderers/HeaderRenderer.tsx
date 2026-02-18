import { InputHTMLAttributes, useRef, useState } from "react";
import { RenderHeaderCellProps } from "react-data-grid";
import { IoFilter } from "react-icons/io5";
import { FilterMenu } from "./FilterMenu";
import { ColumnType } from "@/lib/database/types";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import { FaKey } from "react-icons/fa";
import { FcKey } from "react-icons/fc";

const columnTypeToInputType = (t: ColumnType): InputHTMLAttributes<HTMLInputElement>["type"] => {
  switch (t.type) {
    case "int":
      return "number";
    case "float":
      return "number";
    case "date":
      return "date";
    case "string":
      return "text";
    case "bool":
      return "checkbox";
    case "enum":
      return "text";
    case "blob":
      return "text";
    case "timestamp":
      return "datetime-local";
  }
}

const operatorsForType = (t: ColumnType, fkeyValues: boolean) => {
  if (fkeyValues) {
    return [
      {
        operator: "none",
        display: "None"
      }, {
        operator: "=",
        display: "Equals"
      }, {
        operator: "!=",
        display: "Does not equal"
      }]
  }
  switch (t.type) {
    case "int":
    case "float":
    case "date":
    case "blob":
    case "timestamp":
      return [{
        operator: "none",
        display: "None"
      }, {
        operator: "=",
        display: "Equals"
      }, {
        operator: "!=",
        display: "Does not equal"
      },
      {
        operator: ">",
        display: "Greater than"
      },
      {
        operator: ">=",
        display: "Greater than or equal to"
      },
      {
        operator: "<",
        display: "Less than"
      },
      {
        operator: "<=",
        display: "Less than or equal to"
      }];
    case "bool":
      return [{
        operator: "none",
        display: "None"
      }, {
        operator: "=",
        display: "Equals"
      }, {
        operator: "!=",
        display: "Does not equal"
      }];
    case "string":
    case "enum":
      return [{
        operator: "none",
        display: "None"
      }, {
        operator: "=",
        display: "Equals"
      }, {
        operator: "!=",
        display: "Does not equal"
      },
      {
        operator: "like",
        display: "Like",
      },
      {
        operator: ">",
        display: "Greater than"
      },
      {
        operator: ">=",
        display: "Greater than or equal to"
      },
      {
        operator: "<",
        display: "Less than"
      },
      {
        operator: "<=",
        display: "Less than or equal to"
      }];

  }
}

interface FilterData {
  operator: string;
  filterValue: string | number | { id: number; display: string };
  sort: number;
}

export const buildHeaderCellRenderer = (type: string, filterData: () => FilterData, setFilterData: (kind: "operator" | "value" | "sort", value: string | number | { id: number; display: string }) => void, applyFilter: () => void, fkeyValues?: { id: number; display: string }[], primaryV?:boolean) => {
  const parsedType: ColumnType = JSON.parse(type);
  return function renderHeader(props: RenderHeaderCellProps<Record<string, string | number | {
    id: number;
    display: string;
  }>, unknown>) {
    return <HeaderCell
      colName={props.column.name as string}
      type={columnTypeToInputType(parsedType)}
      operators={operatorsForType(parsedType, fkeyValues != null)}
      fkeyValues={fkeyValues}
      filterData={filterData}
      setFilterData={setFilterData}
      applyFilter={applyFilter}
      primaryV={primaryV}
    />
  }
}

const HeaderCell = ({ colName, operators, type, filterData, setFilterData, applyFilter, fkeyValues, primaryV }:
  {
    colName: string,
    operators: { operator: string, display: string }[],
    type: string,
    filterData: () => FilterData,
    setFilterData: (kind: "operator" | "value" | "sort", value: string | number | { id: number; display: string }) => void,
    applyFilter: () => void,
    fkeyValues: { id: number; display: string }[],
    primaryV:boolean
  }) => {
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);

  return <div ref={divRef} className="flex flex-row justify-between items-center">
    <span>{colName}{filterData() && filterData().operator !== "none" ? "*" : ""}</span>
    <div className="flex flex-row justify-between items-center">
      <div>
        {
        primaryV?<><FcKey size={13} className="mx-1"/></>:<></>
        }
      </div>
      <div onClick={() => setFilterOpen(!filterOpen)} className="cursor-pointer">
        <IoFilter />
      </div>
      <div className="cursor-pointer" onClick={() => {
        const nextSort = (filterData() && filterData().sort + 1) % 3;
        setFilterData("sort", nextSort);
      }}>
        {!filterData() && <FaSort />}
        {filterData() && filterData().sort == 0 && <FaSort />}
        {filterData() && filterData().sort == 1 && <FaSortDown />}
        {filterData() && filterData().sort == 2 && <FaSortUp />}
      </div>
    </div>
    <FilterMenu open={filterOpen} setOpen={setFilterOpen} onApplyFilter={applyFilter} headerRef={divRef} operators={operators} type={type} fkeyValues={fkeyValues} filterData={filterData} setFilterData={setFilterData} />
  </div>
}