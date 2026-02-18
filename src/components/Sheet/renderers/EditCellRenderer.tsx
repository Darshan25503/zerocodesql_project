import { ColumnType } from "@/lib/database/types";
import styles from "./EditCellRenderer.module.css";
import type { RenderEditCellProps } from 'react-data-grid';
import { SearchableSelect } from "@/components/General/SearchableSelect";
import { toInputDateTimeFormat, toSQLDateTimeFormat } from "@/lib/utils-shared";

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export const buildTextEditor = (type: string, fkeyValues?: { id: number; display: string }[]) => {
  if (fkeyValues !== undefined) {
    // This is a foreign key editor
    return function textEditor({
      row,
      column,
      onRowChange,
      onClose
    }: RenderEditCellProps<Record<string, string | number | {
      id: number;
      display: string;
    }>, unknown>) {
      let val = row[column.key];
      if (typeof val === "object") {
        return (
          <div>
            <SearchableSelect
              value={{ value: val.id, display: `${val.display} (${val.id})` }}
              onValueChanged={(v) => onRowChange({ ...row, [column.key]: fkeyValues.find(x => x.id === v) })}
              contentStyleOverride={{ width: "unset", color: "black", fontFamily: "inherit", fontSize: "var(--rdg-font-size)" }}
              className={styles["rdg-fkey-dropdown-editor"]}
              options={fkeyValues.map((v) => { return { value: v.id, display: `${v.display} (${v.id})` } })}
            />
          </div>
        )
      } else {
        throw new Error("Invalid object value!");
      }
    };
  }
  const parsedType: ColumnType = JSON.parse(type);
  if (parsedType.type === 'bool') return undefined;
  return function textEditor({
    row,
    column,
    onRowChange,
    onClose
  }: RenderEditCellProps<Record<string, string | number | {
    id: number;
    display: string;
  }>, unknown>) {
    let val = row[column.key];
    switch (parsedType.type) {
      case "int":
      case "float":
        return (
          <input
            className={styles["rdg-text-editor"]}
            ref={autoFocusAndSelect}
            value={typeof val === "object" ? val?.display : val}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            min={parsedType.min}
            max={parsedType.max}
            type="number"
            onBlur={() => onClose(true, false)}
          />
        );

      case "string":
        return (
          <input
            className={styles["rdg-text-editor"]}
            ref={autoFocusAndSelect}
            value={typeof val === "object" ? val?.display : val}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            maxLength={parsedType.length}
            type="text"
            onBlur={() => onClose(true, false)}
          />
        );
      case "date":
        return (
          <input
            className={styles["rdg-text-editor"]}
            ref={autoFocusAndSelect}
            value={typeof val === "object" ? val?.display : val}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
            type="date"
            onBlur={() => onClose(true, false)}
          />
        );
      case "timestamp":
        return (
          <input
            className={styles["rdg-text-editor"]}
            ref={autoFocusAndSelect}
            value={toInputDateTimeFormat(new Date(typeof val === "object" ? val?.display : val))}
            onChange={(event) => onRowChange({ ...row, [column.key]: toSQLDateTimeFormat(new Date(event.target.value)) })}
            type="datetime-local"
          // onBlur={() => onClose(true, false)}
          />
        );
      case "enum":
        return (
          <select className={styles["rdg-text-editor"]}
            value={typeof val === "object" ? val?.display : val}
            onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}>
            {
              parsedType.values.map((v) => <option key={v} value={v}>{v}</option>)
            }
          </select>
        )
    }
    return (
      <input
        className={styles["rdg-text-editor"]}
        ref={autoFocusAndSelect}
        value={typeof val === "object" ? val?.display : val}
        onChange={(event) => onRowChange({ ...row, [column.key]: event.target.value })}
        onBlur={() => onClose(true, false)}
      />
    );
  }
}