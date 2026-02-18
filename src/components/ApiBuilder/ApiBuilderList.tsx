"use client";
import { AsyncReturnType } from "@/lib/database/types";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { API } from "@/lib/manage/api"
import { useEffect, useRef, useState } from "react";
import { ApiBuilderForm } from "./ApiBuilderForm";
import { User } from "@/lib/manage/user";
import { FaRegEye } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineCopyAll } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import Spinner from "../Layout/Spinner";
import DeletePopupMessage from "../Layout/DeletePopupMessage";
import { FaRegCircleQuestion } from "react-icons/fa6";

interface ApiBuilderListProps {
  schema: AsyncReturnType<typeof User.getAccessibleEntities>
  apis: AsyncReturnType<typeof API.listAPIs>
}

interface APIGetResponse {
  display: string;
  name: string;
  enabled: boolean;
  permissions: number;
  dataSource: number;
  database: number;
  table: number;
  apiKey: string;
  columns: number[];
}

export const ApiBuilderList: React.FC<ApiBuilderListProps> = ({ apis, schema }) => {
  const [curPage, setCurPage] = useState(1);
  const [itemsPerPage] = useState(4);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAPIId, setDeleteAPIId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState<string>("");
  const [apiPath, setApiPath] = useState<string>("");
  const [dataSource, setDataSource] = useState<number>(schema.keys().next().value);
  const [database, setDatabase] = useState<number>(-1);
  const [table, setTable] = useState<number>(-1);
  const [methods, setMethods] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  const [targetApi, setTargetApi] = useState<number>(null);
  const usagePopupRef = useRef<HTMLDialogElement>(null);
  const indexOfLastLead = curPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const [guidePerms, setGuidePerms] = useState<number>(0);
  const [selectedApiName, setSelectedApiName] = useState<string | null>(null);
  const [curApis, setCurApis] = useState(apis);
  const curapis = curApis.slice(
    (curPage - 1) * itemsPerPage,
    curPage * itemsPerPage
  );

  const totalPages = Math.ceil(apis.length / itemsPerPage);

  const handleToggleStatus = async (id: number, status: boolean) => {
    const response = await fetch(`/api/api-server`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        enabled: !status,
      })
    });
    const data = await response.json();
    if (response.ok) {
      let text = status ? "API is Disabled" : "API is Enabled";
      toast.success(text);
      setCurApis(prev => prev.map(api => api.Id === id ? { ...api, Enabled: !api.Enabled } : api));
    } else {
      toast.error('Failed to modify API status!');
    }
  };

  const handleNextPage = () => {
    if (curPage < totalPages) {
      setCurPage((prevPage) => (prevPage + 1));
    }
  };

  const handlePreviousPage = () => {
    if (curPage > 1) {
      setCurPage((prevPage) => (prevPage - 1));
    }
  };

  const deleteAPI = async (id: number) => {
    setLoading(true);
    await fetch(`/api/api-server/${id}`, {
      method: "DELETE",
    }).then(response => response.json())
      .then(data => {
        setLoading(false);
        setIsDeleteModalOpen(false);
        setDeleteAPIId(null);
        toast.success(data.message);
        window.location.reload();
      })
      .catch(error => {
        setLoading(false);
        toast.error("Failed to delete form!");
        console.error('Error:', error);
      });
  }

  const editAPI = async (id: number) => {
    let resp = await fetch(`/api/api-server/${id}`, {
      method: "GET",
    });

    if (resp.ok) {
      let data = await resp.json() as APIGetResponse;
      setName(data.display);
      setApiPath(data.name);
      setDataSource(data.dataSource);
      setIsPrivate(data.apiKey != "");
      setDataSource(data.dataSource);
      setDatabase(data.database);
      setTable(data.table);
      setApiKey(data.apiKey);
      setSelectedColumns(data.columns);
      let methods = [];
      if ((data.permissions & 1) > 0) methods.push("GET");
      if ((data.permissions & 2) > 0) methods.push("POST");
      if ((data.permissions & 4) > 0) methods.push("PATCH");
      if ((data.permissions & 8) > 0) methods.push("DELETE");
      setMethods(methods);
      setTargetApi(id);
      dialogRef.current.showModal();
    }
  }

  const handleCopy = (ln: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/api/${ln}`);
    toast.success("Link Copied");
  }

  const getApiUsageGuide = (permissions: number, apiName: string) => {
    let guide = `Usage Guide for API: ${apiName}\n\n`;

    if (permissions & 1) {
      guide += `GET: \nURL: /api/${apiName}/list\nSample Response: {\n  "data": [...]\n}\n\n`;
    }
    if (permissions & 2) {
      guide += `POST: \nURL: /api/${apiName}/create\nPayload: {\n  "field1": "value1",\n  "field2": "value2"\n}\n\n`;
    }
    if (permissions & 4) {
      guide += `PUT: \nURL: /api/${apiName}/update/{id}\nPayload: {\n  "field1": "newValue"\n}\n\n`;
    }
    if (permissions & 8) {
      guide += `DELETE: \nURL: /api/${apiName}/delete/{id}\n\n`;
    }

    return guide;
  };

  const showUsageGuide = (permissions: number, apiName: string) => {
    const guide = getApiUsageGuide(permissions, apiName);
    setGuidePerms(permissions)
    setSelectedApiName(apiName);
    usagePopupRef.current?.showModal();
  };

  const dialogRef = useRef(null);

  return (
    <div>
      <dialog className={isDeleteModalOpen ? "modal modal-open" : "modal"}>
        <div className="modal-box">

          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label="Close"
              onClick={() => { setIsDeleteModalOpen(false) }}
            >
              <IoCloseSharp />
            </button>
          </form>
          <DeletePopupMessage name={curApis.find(apis => apis.Id === deleteAPIId)?.Name} type={'API'} />
          <div className="mt-[20px] flex justify-end">
            <button className="btn btn-md btn-primary hover:btn-error hover:text-white"
              onClick={() => { deleteAPI(deleteAPIId) }}>
              {loading ? <Spinner /> : <>DELETE</>}
            </button>
          </div>
        </div>
      </dialog>
      <ApiBuilderForm ref={dialogRef} schema={schema} editing={true} name={name} apiPath={apiPath} dataSource={dataSource} database={database} table={table} methods={methods} isPrivate={isPrivate} apiKey={apiKey} targetId={targetApi} columns={selectedColumns} />

      {/* Usage Guide Modal */}
      <dialog ref={usagePopupRef} className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label="Close"
              onClick={() => usagePopupRef.current?.close()}
            >
              <IoCloseSharp />
            </button>
          </form>
          <h3 className="text-lg font-bold">Usage Guide for {selectedApiName}</h3>
          <pre className="bg-gray-100 p-4 mt-4 rounded-md">
            {(guidePerms & 1) ?
              <><br />
                GET /api/{selectedApiName}/list:<br />
                Get a list of records from the API.<br />
                Query Parameters:<br />
                - offset: The offset of the records to retrieve. Default is 0.<br />
                - limit: The maximum number of records to retrieve. Default is 100.<br />

                GET /api/{selectedApiName}/[id]:<br />
                Get a specific record from the API.<br />
              </> : ""}

            {(guidePerms & 2) ?
              <><br />
                POST /api/{selectedApiName}:<br />
                Create a new record using the API.<br />
                Request Body: Record&lt;string, string&gt;<br />
              </> : ""
            }

            {(guidePerms & 4) ?
              <><br />
                PATCH /api/{selectedApiName}/[id]:<br />
                Update a specific record using the API.<br />
                Request Body: Record&lt;string, string&gt;<br />
              </> : ""
            }

            {(guidePerms & 8) ?
              <><br />
                DELETE /api/{selectedApiName}/[id]:<br />
                Delete a specific record using the API.<br />
              </> : ""
            }
          </pre>
        </div>
      </dialog>

      {/* API Table */}
      <table className="table table-auto bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-slate-700 text-white">
          <tr>
            <th className='text-center'>Sr No</th>
            <th className="text-center">Name</th>
            <th className="text-center">Path</th>
            <th className="text-center">Hits</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {curapis.map((api, index) => (
            <tr key={api.Id}>
              <td className='text-center'>{indexOfFirstLead + index + 1}</td>
              <td className="text-center">{api.Display}</td>
              <td className="text-center justify-center flex mt-[3px] align-middle">
                <p className="max-w-64 mt-1 overflow-hidden">{window.location.origin}/api/{api.Name}<span className='mt-1'>....</span></p>
                <button className='ml-2 mt-1' onClick={() => { handleCopy(api.Name) }}><MdOutlineCopyAll size={15} /></button>
              </td>
              <td className="text-center">{api._count.ApiHits}</td>
              <td className="text-center"><div className={`badge w-20 badge-success gap-2 ${api.Enabled ? 'badge-success' : 'badge-error'} text-white text-center`}>{api.Enabled ? "Active" : "Inactive"}</div></td>
              <td className="text-center">
                <button className={'btn btn-sm bg-slate-700 text-white hover:text-black mr-2'} onClick={async () => await editAPI(api.Id)}>
                  <FaEdit />
                </button>
                <button className={'btn btn-sm bg-slate-500 text-white hover:text-black mr-2 '} onClick={() => { setDeleteAPIId(api.Id); setIsDeleteModalOpen(true); }}>
                  <FaTrashAlt />
                </button>
                <a className={`btn btn-sm bg-slate-500 text-white hover:text-black mr-2 ${api.Enabled ? '' : 'btn-disabled'}`}
                  href={`${window.location.origin}/api/${api.Name}/list`} target='_blank'>
                  <button><FaRegEye size={15} /></button>
                </a>
                <button className="btn btn-sm bg-slate-500 text-white hover:text-black mr-2" onClick={() => showUsageGuide(api.Permissions, api.Name)}>
                  <FaRegCircleQuestion />
                </button>
                <button className='align-middle'>
                  <input type="checkbox" className="toggle toggle-success"
                    checked={api.Enabled} onClick={(e) => { handleToggleStatus(api.Id, api.Enabled) }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between mt-4">
        <button
          className="btn-sm mr-6 rounded-md bg-slate-700 text-white"
          onClick={handlePreviousPage}
          disabled={curPage === 1}
        >
          Previous
        </button>
        <span>
          Page {curPage} of {totalPages}
        </span>
        <button
          className="btn-sm mr-6 rounded-md bg-slate-700 text-white"
          onClick={handleNextPage}
          disabled={curPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
