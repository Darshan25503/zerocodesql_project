"use client"
import Papa from 'papaparse';
import React, { useState, useRef } from 'react';
import { FaCheckCircle } from 'react-icons/fa';

type TableHeader = {
  name: string;
  display: string;
  type: string;
  order: number;
  primary: boolean;
};

export const ImportDialog = ({ dbColumns, importType, open, setOpen, url }: { dbColumns: TableHeader[], importType: "csv" | "json" | "excel", open: boolean, setOpen: (open: boolean) => void, url: string }) => {
  let importDisplayType = "";
  let importExtension = "";
  switch (importType) {
    case "csv":
      importDisplayType = "CSV";
      importExtension = ".csv";
      break;
    case "json":
      importDisplayType = "JSON";
      importExtension = ".json";
      break;
    case "excel":
      importDisplayType = "Excel";
      importExtension = ".xlsx";
      break;
  }

  const [error, setError] = useState("");
  const [importState, setImportState] = useState(0); // 0 - upload, 1 - columns, 2 - success
  const [headers, setHeaders] = useState([] as string[]);
  const [data, setData] = useState([] as string[][]);
  const [selectedHeaders, setSelectedHeaders] = useState([] as number[]);
  const [headerMapping, setHeaderMapping] = useState<Record<number, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const importFile = () => {
    if (inputRef.current.files?.length) {
      const file = inputRef.current.files[0];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          complete: (results) => {
            const parsedData = results.data as string[][];
            setHeaders(parsedData[0]);
            setData(parsedData.slice(1));

            let hMap = {} as Record<number, string>;
            let selHeaders = [];
            for (let i = 0; i < parsedData[0].length; i++) {
              if (i < dbColumns.length) {
                selHeaders.push(i);
                hMap[i] = dbColumns[i].name;
              } else {
                hMap[i] = dbColumns[0].name;
              }

            }

            setSelectedHeaders(selHeaders);
            setHeaderMapping(hMap);
            setImportState(1);
          },
          header: false
        });
      } else if (fileExtension === 'json') {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result as string;
          const parsedData = JSON.parse(content) as { [key: string]: string }[];

          if (parsedData.length > 0) {
            const newHeaders = Object.keys(parsedData[0]);

            let hMap = {} as Record<number, string>;
            let selHeaders = [];
            for (let i = 0; i < newHeaders.length; i++) {
              if (i < dbColumns.length) {
                selHeaders.push(i);
                hMap[i] = dbColumns[i].name;
              } else {
                hMap[i] = dbColumns[0].name;
              }

            }

            let data = [] as string[][];
            for (let i = 0; i < parsedData.length; i++) {
              let row = [] as string[];
              for (let j = 0; j < newHeaders.length; j++) {
                row.push(parsedData[i][newHeaders[j]]);
              }
              data.push(row);
            }

            setSelectedHeaders(selHeaders);
            setHeaderMapping(hMap);
            setData(data);

            setHeaders(newHeaders);
            setImportState(1);
          } else {
            setError('No data found in the JSON file');
          }
        };
        reader.readAsText(file);
      } else {
        setError('Unsupported file type. Please upload a valid file.');
      }
    }
  };

  const submitImportData = async () => {
    let insertData = [];
    for (let i = 1; i < data.length; i++) {
      let row = {} as Record<string, string>;
      for (let selIndex of selectedHeaders) {
        row[headerMapping[selIndex]] = data[i][selIndex];
      }
      insertData.push(row);
    }

    const response = await fetch(`/api/sheet/${url}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inserts: insertData,
      })
    });

    setImportState(2);
  };


  return (<dialog className={`modal ${open ? 'modal-open' : ''}`}>
    <div className="modal-box">
      <h3 className="font-bold text-lg">Import {importDisplayType}</h3>
      {importState === 0 && <>
        <p className="py-4">
          Please select the file you would like to import
        </p>
        <input type="file" accept={importExtension} ref={inputRef} className="file-input file-input-bordered w-full" />
        <p className="py-4 text-red-600">{error}</p>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => setOpen(false)}>Cancel</button>
          </form>
          <button className="btn btn-primary" onClick={() => importFile()}>Import</button>
        </div></>}
      {importState === 1 && <>
        <p className="py-4">
          Please select the columns you would like to import
        </p>
        <div className="overflow-y-auto h-96">
          <table className="table w-full table-pin-cols">
            <thead>
              <tr>
                <th>Import</th>
                <th>Column Name</th>
                <th>Target Column</th>
              </tr>
            </thead>
            <tbody>
              {headers.map((column, index) => (
                <tr key={index}>
                  <td>
                    <input type="checkbox" className='checkbox'
                      checked={selectedHeaders.includes(index)}
                      onChange={(v) => {
                        if (selectedHeaders.length === dbColumns.length && v.target.checked) return;
                        setSelectedHeaders(prev => prev.includes(index) ? prev.filter(r => r !== index) : [...prev, index]);
                      }
                      } />
                  </td>
                  <th>{column}</th>
                  <td>
                    <select className="select select-bordered" value={headerMapping[index]} onChange={(e) => setHeaderMapping(prev => ({ ...prev, [index]: e.target.value }))} >
                      {
                        dbColumns.map((header, index) => (
                          <option key={index} value={header.name}>{header.display}</option>
                        ))
                      }
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => setImportState(0)} >Back</button>
          </form>
          <button className="btn btn-primary" onClick={async () => await submitImportData()} >Import</button>
        </div>
      </>}
      {importState === 2 && <>
        <p className="py-4 text-center">
          Imported successfully
        </p>
        <div className='flex justify-center align-middle'>
          <FaCheckCircle size={48} />
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={() => setOpen(false)} >Close</button>
          </form>
        </div>
      </>}
    </div>
  </dialog>)
}