"use client"
import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { MdClear, MdDeleteForever } from "react-icons/md";
import { HiOutlineMenu } from 'react-icons/hi';
import { CgExport, CgImport } from 'react-icons/cg';
import { FaCog, FaCopy, FaRegCopy } from 'react-icons/fa';
import { ImportDialog } from './import';
import { AsyncReturnType, ColumnType } from '@/lib/database/types';
import { Database } from '@/lib/database/database';
import DataGrid, { Column, RowsChangeData } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { buildCellRenderer } from './renderers/CellRenderer';
import { buildTextEditor } from './renderers/EditCellRenderer';
import styles from './cellStyle.module.css';
import { produce } from "immer";
import { User } from '@/lib/manage/user';
import React from 'react';
import { RolePermissions } from '@/lib/manage/role';
import { createPortal } from 'react-dom';
import { FaRegPaste, FaRegTrashCan } from 'react-icons/fa6';
import SpinnerNamed from '../Layout/SpinnerNamed';
import { buildHeaderCellRenderer } from './renderers/HeaderRenderer';
import { TbRowInsertBottom } from "react-icons/tb";
import toast from 'react-hot-toast';
import DialogBoxHeader from './SheetElements/DialogBoxHeader';
import { SearchableSelect } from '../General/SearchableSelect';
import { boolean } from 'zod';

type TableHeader = {
  name: string;
  display: string;
  type: string;
  order: number;
  primary: boolean;
  fkeyValues?: { id: number; display: string }[];
};

interface FilterData {
  operator: string;
  filterValue: string | number | { id: number; display: string };
  sort: number;
}

interface SpreadsheetProps {
  url: string,
  fkeySettings: {
    id: number;
    name: string;
    display: string;
    currentDisplayTargetId: number;
    columnTable: {
      id: number;
      name: string;
      display: string;
    };
    possibleDisplays: {
      id: number;
      name: string;
      display: string;
    }[];
  }[],
  permissionFlags: AsyncReturnType<typeof User.getPermissions>,
}

const Spreadsheet = (props: SpreadsheetProps) => {
  const [data, setData] = useState<AsyncReturnType<Database["fetch"]>>([]);
  const [headers, setHeaders] = useState<TableHeader[]>([]);
  const [columns, setColumns] = useState<Column<AsyncReturnType<Database["fetch"]>[number]>[]>([]);
  const [displayColumns, setDisplayColumns] = useState([] as number[]);
  const [primaryKey, setPrimaryKey] = useState<string>("");
  const [showModal, setShowModal] = useState(false); // Modal state
  const [showFModal, setShowFModal] = useState(false); // Modal state
  const [newHeaders, setNewHeaders] = useState<TableHeader[]>([]); // Track the updated headers
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [totalRecords, setTotalRecords] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [importType, setImportType] = useState("csv" as "csv" | "json" | "excel");
  const [initialData, setInitialData] = useState<AsyncReturnType<Database["fetch"]>>([]);
  const [changedData, setChangedData] = useState<Record<string | number, AsyncReturnType<Database["fetch"]>[number]>>({});
  const [deletedData, setDeletedData] = useState<(string | number)[]>([]);
  const [fKeyDisplayData, setFKeyDisplayData] = useState(props.fkeySettings.map(r => (r.currentDisplayTargetId)))
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const menuRef = useRef<HTMLUListElement | null>(null);
  const [selectedHeaders, setSelectedHeaders] = useState<number[]>([]);
  const [startRow, setStartRow] = useState(1);
  const [rowCount, setRowCount] = useState(1);
  const [selectAllRows, setSelectAllRows] = useState(false);
  const [selectAllCols, setSelectAllCols] = useState(false);
  const [applyFilter, setApplyFilter] = useState(false);
  const [filterData, setFilterData] = useState<FilterData[]>([]);
  const [sortTemp, setSortTemp] = useState({ dummy: true });
  const [exportType, setExportType] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [showInsertModal, setShowInsertModal] = useState(false);
  const [insertData, setInsertData] = useState<AsyncReturnType<Database["fetch"]>[number]>({});

  const handleSelectAllRows = (checked: boolean) => {
    setSelectAllRows(checked);
    if (checked) {
      setStartRow(1);
      setRowCount(totalRecords);
    }
  };

  const handleSelectAllCols = (checked: boolean) => {
    setSelectAllCols(checked);
    if (checked) {
      setSelectedHeaders(newHeaders.map((_, index) => index));
    }
    else {
      setSelectedHeaders([]);
    }
  };

  const [contextMenuProps, setContextMenuProps] = useState<{
    rowIdx: number;
    col: string;
    top: number;
    left: number;
  } | null>(null);
  const isContextMenuOpen = contextMenuProps !== null;
  const tableRef = useRef<HTMLDivElement>(null);

  const allowDelete = Object.values(props.permissionFlags).every(x => (x & RolePermissions.Delete) !== 0);

  useLayoutEffect(() => {
    if (!isContextMenuOpen) return;

    function onClick(event: MouseEvent) {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) {
        return;
      }
      setContextMenuProps(null);
    }

    addEventListener('click', onClick);

    return () => {
      removeEventListener('click', onClick);
    };
  }, [isContextMenuOpen]);

  const setCellClass = useCallback((r: AsyncReturnType<Database["fetch"]>[number]) => {
    if (Object.hasOwn(changedData, r[primaryKey as string | number] as string | number))
      return styles['sheet-cell-changed'];
    if (deletedData.includes(r[primaryKey as string | number] as string | number))
      return styles['sheet-cell-deleted'];
    return styles['sheet-cell'];
  }, [changedData, primaryKey, deletedData]);

  const setFilterDataFn = (idx: number, kind: "operator" | "value" | "sort", value: string | number | { id: number; display: string }) => {
    setFilterData(produce(filterData, draft => {
      switch (kind) {
        case "operator":
          draft[idx].operator = value as string;
          break;
        case "value":
          if (headers[idx].fkeyValues != null) {
            draft[idx].filterValue = headers[idx].fkeyValues.find(x => x.id === value);
          } else
            draft[idx].filterValue = value;
          break;
        case "sort":
          draft[idx].sort = value as number;
      }
    }));
    if (kind === "sort") {
      setSortTemp({ dummy: true });
    }
  }

  const applyFilterFn = () => {
    getDataView(currentPage, rowsPerPage); // Redo this, but with filters
  }

  useEffect(() => {
    applyFilterFn();
  }, [sortTemp]);

  const getDataView = (page: number, pageCount: number) => {
    setIsLoading(true);
    let offset = (page - 1) * pageCount;
    let limit = pageCount;
    let filterFetchData = headers.length !== 0 ? headers.map((x, i) => {
      return {
        name: x.name,
        filter: {
          operator: filterData[i].operator,
          value: typeof filterData[i].filterValue === "object" ? (filterData[i].filterValue as { id: number; display: string }).id : filterData[i].filterValue,
          sort: filterData[i].sort
        }
      }
    }) : [];
    const fetchData = fetch(`/api/sheet/${props.url}/fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        offset: offset,
        limit: limit,
        filter: filterFetchData
      })
    });
    fetchData.then(res => res?.json()).then(d => {
      let rd: {
        headers: TableHeader[],
        data: AsyncReturnType<Database["fetch"]>,
        total: number
      } = d;
      rd.headers.sort((a, b) => a.order - b.order);

      setInitialData(structuredClone(rd.data));

      // Postprocess the data to match with the "changedData"
      for (const r of rd.data) {
        if (Object.hasOwn(changedData, r[primaryKey] as string | number)) {
          const updatedRow = changedData[r[primaryKey] as string | number];
          Object.assign(r, updatedRow);
        }
      }
      // Now delete the data according to "deletedData"
      rd.data = rd.data.filter(x => !deletedData.includes(x[primaryKey] as string | number));
      if (filterData.length == 0) {
        setFilterData(rd.headers.map(x => ({ filterValue: x.fkeyValues == null || x.fkeyValues.length == 0 ? "" : x.fkeyValues[0], operator: "none", sort: 0 })));
      }

      setColumns(rd.headers.map((x, i) => ({
        key: x.name,
        name: x.display,
        renderCell: buildCellRenderer(x.type),
        renderEditCell: (props.permissionFlags[x.name] & RolePermissions.Update && !x.primary) ? buildTextEditor(x.type, x.fkeyValues ? x.fkeyValues : undefined) : undefined,
        cellClass: setCellClass,
        renderHeaderCell: buildHeaderCellRenderer(x.type, () => filterData[i], (k, v) => setFilterDataFn(i, k, v), applyFilterFn, x.fkeyValues ? x.fkeyValues : undefined, x.primary),
        headerCellClass: styles['sheet-header-cell'],
      })));
      let colDisplays = [];
      for (let i = 0; i < rd.headers.length; i++)
        colDisplays.push(i);
      setDisplayColumns(colDisplays);
      setPrimaryKey(rd.headers.find(x => x.primary).name);
      setHeaders(rd.headers);
      setNewHeaders(rd.headers); // Initialize new headers for the modal
      setData(rd.data);
      setTotalRecords(rd.total);
      setIsLoading(false);

      // The insert data thing - blank stuff
      let ins: typeof insertData = {};
      for (const h of rd.headers) {
        if (h.primary) continue;
        let ctype = JSON.parse(h.type) as ColumnType;
        ins[h.name] = ["int", "float", "bool"].includes(ctype.type) ? 0 : "";
      }
      setInsertData(ins);
    });
  };

  useEffect(() => {
    setColumns(headers.map((x, i) => ({
      key: x.name,
      name: x.display,
      renderCell: buildCellRenderer(x.type),
      renderEditCell: (props.permissionFlags[x.name] & RolePermissions.Update && !x.primary) ? buildTextEditor(x.type, x.fkeyValues ? x.fkeyValues : undefined) : undefined,
      cellClass: setCellClass,
      renderHeaderCell: buildHeaderCellRenderer(x.type, () => filterData[i], (k, v) => setFilterDataFn(i, k, v), applyFilterFn, x.fkeyValues ? x.fkeyValues : undefined, x.primary),
      headerCellClass: styles['sheet-header-cell'],
    })));
  }, [filterData, data, deletedData]);

  const updateDisplayNames = async (headers: TableHeader[]) => {
    const headerJson = headers.map(h => ({ name: h.name, display: h.display }));
    const postData = await fetch(`/api/sheet/${props.url}/headers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(headerJson),
    });
    location.reload();
  }

  const updateForeignKeyDisplays = async () => {
    const postData = props.fkeySettings.map((r, i) => {
      return { id: r.id, targetId: fKeyDisplayData[i] }
    });
    await fetch(`/api/sheet/${props.url}/fkeys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    location.reload();
  }

  const submitDataChanges = async () => {
    setSubmitting(true);
    let resp = await fetch(`/api/sheet/${props.url}/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ updates: changedData, deletes: deletedData }),
    });
    if (resp.status === 200) {
      setInitialData(structuredClone(data)); // Update the initial data - now this will be the new state
      setChangedData({});
      setDeletedData([]);
    }
    setSubmitting(false);
  }

  const onRowsChange = (r: NoInfer<AsyncReturnType<Database["fetch"]>>, d: RowsChangeData<NoInfer<AsyncReturnType<Database["fetch"]>[number]>, unknown>) => {
    setData(r);
    setChangedData(produce(changedData, draft => {
      for (const idx of d.indexes) {
        const rowData = r[idx];
        const rowPkey = rowData[primaryKey] as string | number;
        draft[rowPkey] = rowData;
      }
    }));
  }
  const exportData = async (startRow: number, rowCount: number, format: string, doFilters: boolean) => {
    setExportLoading(true);
    try {
      let filterFetchData = doFilters && headers.length !== 0 ? headers.map((x, i) => {
        return {
          name: x.name,
          filter: {
            operator: filterData[i].operator,
            value: typeof filterData[i].filterValue === "object" ? (filterData[i].filterValue as { id: number; display: string }).id : filterData[i].filterValue,
            sort: filterData[i].sort
          }
        }
      }) : [];
      const response = await fetch(`/api/sheet/${props.url}/fetch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          offset: startRow,
          limit: rowCount,
          filter: filterFetchData
        })
      });

      if (!response.ok) {
        toast.error(`Error fetching data`);
        return;
      }

      const rd = await response.json();

      const sortedHeaders = newHeaders
        .map((header, index) => ({ ...header, index }))
        .sort((a, b) => a.order - b.order); // Sorting headers by their "order" value

      let selectedHeaderNames: string[] = [];
      let selectedHeaderDisplays: string[] = [];

      // Select only the headers that are in selectedHeaders and after sorting them
      sortedHeaders.forEach((key) => {
        if (selectedHeaders.includes(key.index)) {
          selectedHeaderNames.push(key.name);
          selectedHeaderDisplays.push(key.display);  // Used for CSV headers
        }
      });

      if (format === 'csv') {
        let csvContent = selectedHeaderDisplays.join(',') + '\n'; // CSV header row

        rd.data.forEach((row: any) => {
          let csvRow = selectedHeaderNames.map(header => {
            const value = row[header];

            if (typeof value === 'object' && value !== null) {
              return value.id === null ? "" : value.id;
            }
            return value || "";
          }).join(',');

          csvContent += csvRow + '\n';
        });

        downloadFile(csvContent, 'csv');
      } else if (format === 'json') {
        const jsonContent = rd.data.map((row: any) => {
          let filteredRow: any = {};
          selectedHeaderNames.forEach(header => {
            const value = row[header];
            filteredRow[header] = value;
          });
          return filteredRow;
        });

        downloadFile(JSON.stringify(jsonContent, null, 2), 'json');
      }

    } catch (error) {
      toast.error('Error during fetch or file generation:', error);
    }
  };

  const downloadFile = (content: string, format: string) => {
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;' });

    const now = new Date();
    const ddmmyyyyhms = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const filename = `export_${ddmmyyyyhms}.${format}`;

    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setShowExportModal(false);
    let ftype = (format === 'csv' ? 'CSV' : 'JSON');
    toast.success(`Downloaded ${ftype} file successfully!`);
    setExportLoading(false);
  };

  const columnSlice = columns.filter((x, idx) => displayColumns.includes(idx));

  const handleStartRow = (value: number) => {
    setStartRow(value > totalRecords ? totalRecords : value);
  }

  useEffect(() => {
    setRowCount(rowCount > (totalRecords - startRow + 1) ? (totalRecords - startRow + 1) : rowCount);
  }, [startRow]);

  useEffect(() => {
    getDataView(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    setCurrentPage(prevPage => {
      const newPage = direction === 'next' ? Math.min(prevPage + 1, totalPages) : Math.max(1, prevPage - 1);
      return newPage;
    });

    if (tableRef.current) {
      tableRef.current.scrollTop = 0;
    }
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  const handleRevert = () => {
    setData(initialData);
    setChangedData({});
    setDeletedData([]);
  }

  const SkeletonLoader = () => (
    <div className="animate-pulse">
      {/* Render Skeleton Rows */}
      {Array(10)
        .fill("")
        .map((_, idx) => (
          <div key={idx} className="grid grid-cols-5 gap-4 p-2">
            {Array(5)
              .fill("")
              .map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-8 bg-gray-300 rounded"
                ></div>
              ))}
          </div>
        ))}
    </div>
  );

  let types = headers.filter(h => props.permissionFlags[h.name] & RolePermissions.Create && !h.primary).map((x) => JSON.parse(x.type) as ColumnType);
  const handleInsertRow = async () => {
    // Now perform the insert

    let processedData = structuredClone(insertData);
    for (const [k, v] of Object.entries(processedData)) {
      if (typeof v === "object" && v !== null) {
        processedData[k] = v.id;
      }
    }

    const response = await fetch(`/api/sheet/${props.url}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inserts: [processedData],
      })
    });

    if (response.ok) {
      toast.success("Successfully inserted data");
    } else {
      toast.error(`Error inserting data`);
    }

    // Reset the fields
    // The insert data thing - blank stuff
    let ins: typeof insertData = {};
    for (const h of headers) {
      if (h.primary) continue;
      let ctype = JSON.parse(h.type) as ColumnType;
      ins[h.name] = ["int", "float", "bool"].includes(ctype.type) ? 0 : "";
    }
    setInsertData(ins);
    setShowInsertModal(false);
    applyFilterFn();
  }

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <div className="p-4 flex flex-col h-screen">
      <div className="flex flex-row">
        {/* Dropdown menus for Fields, Import, Export */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1"><HiOutlineMenu />Fields</div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow">
            {headers.map((header, index) => (
              <li key={index}>
                <a className='flex flex-row justify-between'>
                  {header.name}
                  <input type="checkbox" className="toggle toggle-sm" checked={displayColumns.includes(index)}
                    onChange={() => setDisplayColumns(prev => prev.includes(index) ? prev.filter(x => x !== index) : [...prev, index])} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1"><CgImport />Import</div>
          <ul tabIndex={0} className={`dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow`}>
            <li><a onClick={() => setShowImport(true)}>CSV</a></li>
            <li><a onClick={() => setShowImport(true)}>JSON</a></li>
          </ul>
        </div>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1"><CgExport />Export</div>
          <ul tabIndex={0} className={`dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow ${showExportModal ? 'hidden' : 'block'} `}>
            <li><a onClick={() => (setShowExportModal(true), setExportType('csv'))}>CSV</a></li>
            <li><a onClick={() => (setShowExportModal(true), setExportType('json'))}>JSON</a></li>
          </ul>
        </div>
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn m-1"><FaCog />Display Settings</div>
          <ul tabIndex={0} className={`dropdown-content menu bg-base-100 rounded-box z-[2] w-52 p-2 shadow ${showModal ? 'hidden' : 'block'} `}>
            <li><a onClick={() => setShowModal(true)}>Column Displays</a></li>
            <li><a onClick={() => setShowFModal(true)}>Foreign Key Displays</a></li>
          </ul>
        </div>
        <div tabIndex={0} role="button" className="btn m-1"
          onClick={() => setShowInsertModal(true)}><TbRowInsertBottom size={20} />Insert new Row</div>
        <div className="flex-grow"></div>

        {/* Save and Revert buttons aligned to the right */}
        {(Object.keys(changedData).length > 0 || deletedData.length > 0) && <div className="flex space-x-2 justify-end">
          <div className='btn btn-primary m-1' onClick={async () => await submitDataChanges()}>
            {submitting ? <SpinnerNamed name='Saving...' /> : "Save"}
          </div>
          <div className='btn btn-error m-1' onClick={() => handleRevert()}>Revert</div>
        </div>}
      </div>

      <ImportDialog dbColumns={headers} importType={importType} open={showImport} setOpen={setShowImport} url={props.url} />

      {
        isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="overflow-auto mt-5  max-h=[70%]" ref={tableRef}>
            <DataGrid
              className="h-[calc(90vh-200px)]"
              columns={columnSlice}
              rows={data}
              onRowsChange={onRowsChange}
              style={{ backgroundColor: 'white' }}
              onCellContextMenu={(cur, event) => {
                event.preventGridDefault();
                event.preventDefault();
                setContextMenuProps({
                  rowIdx: data.indexOf(cur.row),
                  col: cur.column.key,
                  top: event.clientY,
                  left: event.clientX
                });
              }}
            />
          </div>
        )
      }

      {/* Pagination */}
      <div className="flex justify-between items-center mt-2">
        <div>
          <label htmlFor="rowsPerPage" className="mr-2 text-sm text-gray-700">Rows per page:</label>
          <select
            id="rowsPerPage"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border p-1 rounded text-sm"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            className={`m-1 p-1 ${currentPage === 1 ? 'bg-gray-300' : 'bg-slate-600'}  rounded text-sm p-2 text-white`}
          >
            Previous
          </button>
          <span className="m-1 p-1 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange('next')}
            disabled={currentPage * rowsPerPage >= totalRecords}
            className={`m-1 p-1 ${currentPage * rowsPerPage >= totalRecords ? 'bg-gray-300' : 'bg-slate-600'} text-white rounded text-sm p-2`}
          >
            Next
          </button>
        </div>
      </div>
      <div className='flex flex-row w-full justify-center gap-2'>

      </div>

      {/* Render the Display Settings Modal */}
      <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${showModal ? 'block' : 'hidden'}`}>
        <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <DialogBoxHeader title={'Display Settings'} description={'In the Display Settings , you can customize the table column names to better suit your data display preferences.'} />
          <div className="flex-1 overflow-y-auto p-4">
            <form className="flex flex-col gap-4">
              {newHeaders.map((header, index) => (
                <div key={index} className="flex flex-row justify-between items-center mb-4">
                  <span className="ml-4 text-gray-700">{header.name}</span>
                  <input
                    type="text"
                    value={newHeaders[index].display}
                    onChange={(e) => {
                      setNewHeaders(produce((draft) => {
                        draft[index].display = e.target.value;
                      }));
                    }}
                    autoFocus
                    className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </form>
          </div>
          <div className="flex justify-end mt-6 p-4 border-t border-gray-200">
            <button
              onClick={async () => await updateDisplayNames(newHeaders)} // Log current headers on save
              className="btn hover:bg-black hover:text-white mx-2"
            >
              Save
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="btn hover:bg-red-500 hover:text-white mx-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {/* Render the Foreign Key Display Settings Modal */}
      <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${showFModal ? 'block' : 'hidden'}`}>
        <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <h2 className="font-bold text-lg sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
            Foreign Key Display Settings
          </h2>
          <div className="flex-1 overflow-y-auto p-4">
            <form className="flex flex-col gap-4">
              {props.fkeySettings.map((fkey, index) =>
              (
                <div key={index} className="flex flex-row justify-between items-center mb-4">
                  <span className="ml-4 text-gray-700">{fkey.display}</span>
                  <select
                    className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={fKeyDisplayData[index]}
                    onChange={(e) => {
                      setFKeyDisplayData(produce((draft) => {
                        draft[index] = parseInt(e.target.value);
                      }));
                    }}
                  >
                    {fkey.possibleDisplays.map((display, subindex) => <option key={subindex} value={display.id}>{display.display}</option>)}
                  </select>
                </div>)
              )}

            </form>
          </div>
          <div className="flex justify-end mt-6 p-4 border-t border-gray-200">
            <button
              onClick={async () => await updateForeignKeyDisplays()} // Log current headers on save
              className="btn hover:bg-black hover:text-white mx-2"
            >
              Save
            </button>

            <button
              onClick={() => setShowFModal(false)}
              className="btn hover:bg-red-500 hover:text-white mx-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      {/* Context Menu */}
      {
        isContextMenuOpen &&
        createPortal(
          <ul ref={menuRef} className="menu bg-base-100 rounded-box z-[2] w-36 p-2 shadow" style={
            {
              position: "absolute",
              top: contextMenuProps.top,
              left: contextMenuProps.left,
              "transition-duration": "200ms",
              "transition-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
              "border-width": "var(--border-btn, 1px)",
              "transition-property": "color, background-color, border-color, opacity, box-shadow, transform",
            } as unknown as React.CSSProperties
          }>
            <li><a onClick={async () => {
              let cellValue = data[contextMenuProps.rowIdx][contextMenuProps.col];
              await navigator.clipboard.writeText(JSON.stringify(cellValue));
              setContextMenuProps(null);
            }}><FaRegCopy />Copy Cell</a></li>
            <li><a onClick={async () => {
              let clipboardData = JSON.parse(await navigator.clipboard.readText()) as string | number | {
                id: number;
                display: string;
              };

              setData(produce(data, draft => {
                draft[contextMenuProps.rowIdx][contextMenuProps.col] = clipboardData;
              }));
              setChangedData(produce(changedData, draft => {
                const rowData = data[contextMenuProps.rowIdx];
                const rowPkey = rowData[primaryKey] as string | number;
                draft[rowPkey] = rowData;
              }));
              setContextMenuProps(null);
            }}><FaRegPaste />Paste Cell</a></li>
            <li><a onClick={async () => {
              let dType = typeof data[contextMenuProps.rowIdx][contextMenuProps.col];
              let typedNullValue: string | number;
              switch (dType) {
                case "number":
                  typedNullValue = 0;
                  break;
                case "string":
                  typedNullValue = "";
                  break;
                case "object":
                  typedNullValue = null;
                  break;
                case "boolean":
                  typedNullValue = 0;
                  break;
              }
              if (typedNullValue !== null) { // Do only for non-objects pls aka non fkeys
                setData(produce(data, draft => {
                  draft[contextMenuProps.rowIdx][contextMenuProps.col] = typedNullValue;
                }));
                setChangedData(produce(changedData, draft => {
                  const rowData = data[contextMenuProps.rowIdx];
                  const rowPkey = rowData[primaryKey] as string | number;
                  draft[rowPkey] = rowData;
                }));
              }
              setContextMenuProps(null);
            }}><MdClear />Clear Cell</a></li>
            {allowDelete && <>
              <hr className='h-0.5 bg-neutral-400'></hr>
              <li><a className="text-red-500" onClick={async () => {
                setDeletedData(produce(deletedData, draft => {
                  const rowData = data[contextMenuProps.rowIdx];
                  const rowPkey = rowData[primaryKey] as string | number;
                  draft.push(rowPkey);
                }));
                setContextMenuProps(null);
              }}><FaRegTrashCan />Delete</a></li>
            </>
            }
          </ul>,
          document.body
        )
      }
      {/* Render the Export Data Modal */}
      <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${showExportModal ? 'block' : 'hidden'}`}>
        <div className="bg-white p-6 rounded shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
          <DialogBoxHeader title={`Exporting ${exportType === 'csv' ? "CSV" : "JSON"} Data`} description={`In this section, you can easily export ${exportType === 'csv' ? "CSV" : "JSON"} data by applying filters to select specific rows and columns. Streamline your data management process and download only the relevant information you need for further analysis.`} />
          <div className='overflow-y-auto pr-9'>
            <div className='pl-4 pr-4 pt-4'>
              <h3 className="font-semibold ">Select Columns to Export</h3>
              {/* Toggle for Selecting All Columns */}
              <div className="flex justify-between items-center ">
                <span className="text-gray-700">Select All Columns</span>
                <div className="relative inline-block w-10 mr-6 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle-all-columns"
                    id="toggleAllColumns"
                    checked={selectAllCols}
                    onChange={(e) => handleSelectAllCols(e.target.checked)}
                    className="toggle toggle-success"
                  />
                </div>
              </div>
              <form className="flex flex-col gap-3">
                {/* Column Selection */}
                <div className="bg-gray-100 pt-5 h-32 overflow-y-auto rounded-xl shadow-lg">
                  {newHeaders.map((header, index) => (
                    <div key={index} className="flex flex-row justify-between items-center mb-4">
                      <span className="ml-10 text-gray-700 flex-grow">{header.name}</span>
                      <input
                        type="checkbox"
                        className="checkbox mr-10"
                        checked={selectedHeaders.includes(index)}
                        onChange={() =>
                          setSelectedHeaders((prev) =>
                            prev.includes(index) ? prev.filter((x) => x !== index) : [...prev, index]
                          )
                        }
                        disabled={selectAllCols} // Disable if selectAllColumns is checked
                      />
                    </div>
                  ))}
                </div>
              </form>
            </div>
            <div className="flex-1 px-4 mt-4">
              <h3 className="font-semibold pt-4">Select No. of Rows to Export</h3>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Select All Rows</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle-all-rows"
                    id="toggleAllRows"
                    checked={selectAllRows}
                    onChange={(e) => handleSelectAllRows(e.target.checked)}
                    className="toggle toggle-success"
                  />
                </div>
              </div>
              {/* Row Selection - disabled when "Select All Rows" is checked */}
              <div className="bg-gray-100 pt-5 pb-3 rounded-xl shadow-lg">
                <div className="flex flex-row items-center mb-4">
                  <label className="ml-10 text-gray-700 flex-grow">Start Row</label>
                  <input
                    type="number"
                    value={startRow}
                    min={1}
                    onChange={(e) => { handleStartRow(Number(e.target.value)) }}
                    className="border p-1 rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-10"
                    disabled={selectAllRows}
                  />
                </div>
                <div className="flex flex-row items-center mb-4">
                  <label className="ml-10 text-gray-700 flex-grow">Total Rows</label>
                  <input
                    type="number"
                    value={rowCount}
                    min={1}
                    onChange={(e) => setRowCount(Number(e.target.value) > (totalRecords - startRow + 1) ? (totalRecords - startRow + 1) : Number(e.target.value))}
                    className="border p-1 rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-10"
                    disabled={selectAllRows}
                  />
                </div>
              </div>

              {/* Toggle for Applying Filters */}
              <div className="flex justify-between items-center my-4">
                <span className="text-gray-700">Apply Filters</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input
                    type="checkbox"
                    name="toggle-filters"
                    id="toggleFilters"
                    checked={applyFilter}
                    onChange={(e) => setApplyFilter(e.target.checked)}
                    className="toggle toggle-success"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Save/Cancel Buttons */}
          <div className="flex justify-end mt-6 p-4 border-t border-gray-200">
            <button
              onClick={async () => await exportData(Math.max(startRow - 1, 0), rowCount, exportType, applyFilter)} // Save action
              className="px-4 py-2 btn hover:bg-black hover:text-white mx-2"
            >
              {exportLoading ? <SpinnerNamed name='Saving...' /> : "Save"}
            </button>
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 btn hover:bg-red-500 hover:text-white mx-2"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Insert New Row Modal */}
      {headers.length !== 0 && Object.values(insertData).length !== 0 &&
        <div className={`fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center ${showInsertModal ? 'block' : 'hidden'}`}>
          <div className="bg-white p-6 rounded shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 z-10">
              <h2 className='font-bold text-lg mb-1'>Insert New Row </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <form className="flex flex-col gap-4">
                {headers.filter(h => props.permissionFlags[h.name] & RolePermissions.Create && !h.primary).map((header, index) => {
                  if (header.fkeyValues) {
                    return (
                      <div key={index} className="flex flex-row justify-between items-center mb-4">
                        <span className="ml-4 text-gray-700">{header.display}</span>
                        <div className="w-full mt-1 p-2 max-w-md">
                          {<SearchableSelect
                            className="border max-w-md border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            contentStyleOverride={{ width: "unset" }}
                            value={{
                              display: (insertData[header.name] as {
                                id: number;
                                display: string;
                              }).display,
                              value: (insertData[header.name] as {
                                id: number;
                                display: string;
                              }).id
                            }}
                            onValueChanged={(v) => {
                              setInsertData(produce(insertData, (draft) => {
                                draft[header.name] = header.fkeyValues.find(x => x.id === v);
                              }));
                            }}
                            options={header.fkeyValues.map((x) => ({
                              display: x.display,
                              value: x.id,
                            }))}
                          />}
                        </div>
                      </div>
                    );
                  }

                  switch (types[index].type) {
                    case "int":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="number"
                            min={types[index].min}
                            max={types[index].max}
                            id={`field-${index}`}
                            required
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = parseInt(e.target.value); }))}
                            value={insertData[header.name] as number}
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      );
                    case "string":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="text"
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = e.target.value; }))}
                            value={insertData[header.name] as string}
                          />
                        </div>
                      );
                    case "float":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="number"
                            step="any"
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = parseInt(e.target.value); }))}
                            value={insertData[header.name] as number}
                          />
                        </div>
                      );
                    case "timestamp":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="datetime-local"
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = e.target.value; }))}
                            value={insertData[header.name] as string}
                          />
                        </div>
                      );
                    case "date":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="date"
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = e.target.value; }))}
                            value={insertData[header.name] as string}
                          />
                        </div>
                      );
                    case "bool":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="checkbox"
                            checked={
                              insertData[header.name] as number > 0
                            }
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = e.target.value ? 1 : 0; }))}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                        </div>
                      );
                    case "enum":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <select
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = e.target.value; }))}
                            value={insertData[header.name] as string}
                          >
                            {types[index].values.map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    case "blob":
                      return (
                        <div key={index} className="flex flex-row justify-between items-center mb-4">
                          <span className="ml-4 text-gray-700">{header.display}</span>
                          <input
                            type="file"
                            className="border p-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setInsertData(produce(insertData, (draft) => { draft[header.name] = e.target.value; }))}
                          />
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </form>
            </div>
            <div className="flex justify-end mt-6 p-4 border-t border-gray-200">
              <button
                onClick={async () => await handleInsertRow()} // Log current headers on save
                className="btn hover:bg-black hover:text-white mx-2"
              >
                Insert
              </button>
              <button
                onClick={() => setShowInsertModal(false)}
                className="btn hover:bg-red-500 hover:text-white mx-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      }
    </div >
  );
};

export default Spreadsheet;

