import { ColumnType } from '@/lib/database/types';
import type { RenderCellProps } from 'react-data-grid'

export const buildCellRenderer = (type: string) => {
  const parsedType: ColumnType = JSON.parse(type);
  switch (parsedType.type) {
    case "int":
    case "float":
    case "string":
    case "enum":
      return function renderValue(props: RenderCellProps<Record<string, string | number | {
        id: number;
        display: string;
      }>, unknown>) {
        try {
          let val = props.row[props.column.key];
          return typeof val === "object" ? val?.display : val;
        } catch {
          return null;
        }
      };
    case "date":
      return function renderValue(props: RenderCellProps<Record<string, string | number | {
        id: number;
        display: string;
      }>, unknown>) {
        try {
          let val = props.row[props.column.key];
          return (new Date(typeof val === "object" ? val?.display : val)).toLocaleDateString();
        } catch {
          return null;
        }
      };
    case "timestamp":
      return function renderValue(props: RenderCellProps<Record<string, string | number | {
        id: number;
        display: string;
      }>, unknown>) {
        try {
          let val = props.row[props.column.key];
          return (new Date(typeof val === "object" ? val?.display : val)).toLocaleString();
        } catch {
          return null;
        }
      };
    case "bool":
      return function renderValue(props: RenderCellProps<Record<string, string | number | {
        id: number;
        display: string;
      }>, unknown>) {
        try {
          let val = props.row[props.column.key];
          const parsedVal = (typeof val === "object" ? val?.display : val) != 0;
          return <input type="checkbox" checked={parsedVal} onChange={(v) => props.onRowChange({ ...props.row, [props.column.key]: v.target.checked ? 1 : 0 })} />
        } catch {
          return null;
        }
      }
  }
}