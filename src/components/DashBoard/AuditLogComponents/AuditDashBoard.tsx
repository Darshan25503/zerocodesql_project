"use client";
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { CgExport } from 'react-icons/cg';
import { AsyncReturnType } from '@/lib/database/types';
import { Audit } from '@/lib/manage/audit';
import { SearchableSelect } from '@/components/General/SearchableSelect';

type User = {
  id: number;
  Username: string;
  Email: string;
  isSuperAdmin: boolean;
  Role: {
    Id: number;
    Name: string;
    Color: string;
  };
}

export default function AuditDashBoard(props: { logCount: number, users: User[] }) {
  const [curPage, setCurPage] = useState<number>(1);
  const [currentAuditLogs, setCurrentAuditLogs] = useState<AsyncReturnType<typeof Audit.get>>([]);
  const [users, setUsers] = useState<User[]>(props.users);
  const [selectedUser, setSelectedUser] = useState<number>(undefined);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState<number> (Math.ceil(props.logCount / itemsPerPage));

  const getAuditLogs = async (page: number, user_id: number) => {
    let data;
    let count;
    if (user_id === undefined || user_id === -1) {
      data = await fetch(`/api/audit?` + new URLSearchParams({ offset: (((page - 1) * itemsPerPage)).toString(), limit: (itemsPerPage).toString() }));
      count = await fetch('/api/audit/count?' + new URLSearchParams({}));
    }
    else {
      data = await fetch(`/api/audit?` + new URLSearchParams({ user_id: `${user_id}`, offset: (((page - 1) * itemsPerPage)).toString(), limit: (itemsPerPage).toString() }));
      count = await fetch('/api/audit/count?' + new URLSearchParams({user_id: `${user_id}`}));
    }
    let jdata = await data.json();
    let jcount = await count.json();
    setTotalPages(Math.ceil(jcount.count / itemsPerPage));
    setCurrentAuditLogs(jdata);
  }

  useEffect(() => {
    getAuditLogs(1, undefined);
  }, []);

  useEffect(() => {
    getAuditLogs(1, selectedUser);
    setCurPage(1);
  }, [selectedUser]);

  const handleNextPage = async () => {
    if (curPage < totalPages) {
      let nextPage = curPage + 1;
      setCurPage(nextPage);
      await getAuditLogs(curPage + 1, selectedUser);
    }
  };

  const handlePreviousPage = async () => {
    if (curPage > 1) {
      let prePage = curPage - 1;
      setCurPage(prePage);
      await getAuditLogs(curPage - 1, selectedUser);
    }
  };

  const handleCSVExport = async (user_id: number) => {
    let data;
    if (user_id === undefined || user_id === -1) {
      data = await fetch(`/api/audit?` + new URLSearchParams({}), { method: 'POST' });
    }
    else {
      data = await fetch(`/api/audit?` + new URLSearchParams({ user_id: `${user_id}` }), { method: "POST" });
    }
    let jdata = await data.json();
    console.log(jdata.length);

    const csvContent = jdata.map((action: { Timestamp: any; User: { Username: any; }; kind: any; Message: any; }) =>
      `${action.Timestamp},${action.User.Username},${action.kind},${action.Message}`
    ).join("\n");

    const csvHeader = "Time,Username,Kind,Action\n";
    const csvData = csvHeader + csvContent;

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    const now = new Date();
    const ddmmyyyyhms = `${now.getDate()}${now.getMonth() + 1}${now.getFullYear()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
    const filename = `logfile_${ddmmyyyyhms}.csv`;

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
  };

  useEffect(() => {
    setCurPage(1);
  }, [selectedUser]);

  return (
    <div className="p-4 text-black">
      <div className="rounded-md bg-slate-100 p-5">
        <h1 className="text-xl font-bold">Audit Logs</h1>
        <p className="text-justify my-5 text-sm">In this section, you can monitor and review user activities across the system.
          The audit logs provide a detailed record of each action performed,
          including the timestamp, username, kind of action and the details about the action.
          This ensures transparency and accountability within the system.
          Additionally, you have the option to export these logs as a CSV file for further analysis.
        </p>

        <div className="flex justify-between items-center mb-4">
          <div className='flex items-center'>
            <h2 className="text-xl font-bold">Latest Logs</h2>
            <div className="flex items-center ml-4">
              <div className="relative">
                <fieldset className="mb-[1px] flex items-center w-72">
                  <SearchableSelect
                    className='block w-full px-3 py-2 text-md bg-gray-50 border border-gray-300 rounded-lg'
                    contentStyleOverride={{ position: "fixed", width: "unset" }}
                    value={{ value: selectedUser, display: 'None' }}
                    options={[{ value: -1, display: 'None' }].concat(users.map((user) => ({ value: user.id, display: user.Username })))}
                    onValueChanged={(v) => setSelectedUser(v as number)}
                  />
                </fieldset>
                {/* <input
                  type="text"
                  placeholder="Search logs..."
                  className="input input-bordered h-[30px] w-100 px-[10px] text-[15px] rounded-[4px] pr-10"
                /> */}
                {/* <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <BsSearch className="text-gray-500" />
                </div> */}
              </div>
              {/* <button className="py-1 px-4 rounded-md bg-slate-700 text-white">Search</button> */}
            </div>
          </div>
          <div onClick={async () => await handleCSVExport(selectedUser)} tabIndex={0} role="button" className="btn bg-base-100"><CgExport />Export CSV</div>
        </div>
        <table className="table table-auto bg-white shadow-md overflow-hidden rounded-lg">
          <thead className='bg-slate-700 text-white'>
            <tr>
              <th className='py-2 px-4 text-l text-center'>Sr No</th>
              <th className='text-center'>Time</th>
              <th className='text-center'>Username</th>
              <th className='text-center'>User Type</th>
              <th className='text-center'>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentAuditLogs.map((form, index) => (
              <tr key={index}>
                <td className='py-2 px-4 text-l text-center'>{(curPage - 1) * itemsPerPage + index + 1}</td>
                <td className='text-center'>{form.Timestamp.toLocaleString().replace('T', ' ')}</td>
                <td className='text-center'>{form.User.Username}</td>
                <td className='text-center'>{form.kind}</td>
                <td className='text-center'>{form.Message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between items-center mt-4">
          <div>
            <button
              className="mr-6 py-1 px-4 rounded-md bg-slate-700 text-white"
              onClick={async () => await handlePreviousPage()}
              disabled={curPage === 1}
            >
              Previous
            </button>
            <span>
              Page {curPage} of {totalPages}
            </span>
            <button
              className="ml-6 py-1 px-4 rounded-md bg-slate-700 text-white"
              onClick={async () => await handleNextPage()}
              disabled={curPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
