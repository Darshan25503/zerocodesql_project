'use client'
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { CgAddR } from "react-icons/cg";

const AddDataSourceModel: React.FC = () => {
  const [showSubInputs, setShowSubInputs] = useState(false);
  const [authType, setAuthTypeProxy] = useState<string>("none");
  const [databaseType, setDatabaseType] = useState<string>("");
  const [host, setHost] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [port, setPort] = useState(0);
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState(0);
  const [proxyUser, setProxyUser] = useState("");
  const [proxyAuthData, setProxyAuthData] = useState("");
  const [databaseFile, setDatabaseFile] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowSubInputs(event.target.checked);
  };
  const handleDatabaseTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setDatabaseType(event.target.value);
  };
  const handleProxyAuthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setAuthTypeProxy(event.target.value);
    setProxyAuthData("");
  };
  const handleSSHFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProxyAuthData(await event.target.files[0].text());
    }
  };

  const router = useRouter();

  const handleConnect = async () => {
    let resp = await fetch('/api/datasource', {
      method: 'POST',
      body: JSON.stringify({
        databaseType: databaseType,
        name: displayName,
        host: host,
        username: username,
        password: password,
        database: database,
        port: port,
        proxyHost: proxyHost,
        proxyPort: proxyPort,
        proxyUser: proxyUser,
        proxyAuthType: authType,
        proxyAuthData: proxyAuthData,
        filename: databaseFile,
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(e => e.json());
    if (resp.success) {
      setDialogOpen(false);
      router.refresh();
    } else {
      alert(resp.message);
    }
  }


  return (
    <>
      <div className='flex items-center justify-between my-5 md:mx-3 sm:ml-2 p-3 text-gray-700 bg-white cursor-pointer rounded-xl shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-102'>
        <button onClick={() => setDialogOpen(true)} className='cursor-pointer' >
          <div><CgAddR size="45" className='ml-4 mt-4' /></div>
          <div className='m-4 text-lg '>Add New Data Source</div>
        </button>
      </div>

      <dialog className={dialogOpen ? "modal modal-open" : "modal"}>
        <div className="modal-box w-7/12 max-w-xl">
          <h3 className="text-lg font-bold">Add Data Source</h3>
          <span>Please fill up the credentials required to connect to a data source</span>

          <div className="mt-4">
            {/*Database Name*/}
            <fieldset className="mb-[12px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]" htmlFor="databaseName">
                Display Name
              </label>
              <input
                className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                id="databaseName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </fieldset>
            {/*DataBase Type*/}
            <fieldset className="mb-[12px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]" htmlFor="databaseType">
                Database Type
              </label>
              <select
                className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                id="database"
                value={databaseType}
                onChange={handleDatabaseTypeChange}>
                <option value="mysql2">MySQL/MariaDB</option>
                <option value="better-sqlite3">SQLite</option>
                <option value="pg">PostgreSQL</option>
                <option value="mssql">Microsoft SQL Server</option>
              </select>
            </fieldset>
            {databaseType == "better-sqlite3" ? (<>
              {/*FileName*/}
              <fieldset className="mb-[12px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]" htmlFor="FileName">
                  File Name
                </label>
                <input
                  className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  id="filename"
                  type="text"
                  value={databaseFile}
                  onChange={(e) => setDatabaseFile(e.target.value)}
                />
              </fieldset></>) : (<>
                {/*Host and Port*/}
                <fieldset className="mb-[12px] flex items-center gap-5">
                  {/*Host*/}
                  <label className="text-black w-[90px] text-right text-[15px]" htmlFor="Host">
                    Host
                  </label>
                  <input
                    className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                    id="Host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                  />
                  {/*Port*/}
                  <label className="text-black w-[30px] text-right text-[15px]" htmlFor="port">
                    Port
                  </label>
                  <input
                    className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                    id="port"
                    value={port}
                    type='number'
                    min={1}
                    max={65535}
                    onChange={(e) => setPort(parseInt(e.target.value))}
                  />
                </fieldset>
                {/*UserName*/}
                <fieldset className="mb-[12px] flex items-center gap-5">
                  <label className="text-black w-[90px] text-right text-[15px]" htmlFor="username">
                    Username
                  </label>
                  <input
                    className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </fieldset>
                {/*Password*/}
                <fieldset className="mb-[12px] flex items-center gap-5">
                  <label className="text-black w-[90px] text-right text-[15px]" htmlFor="password">
                    Password
                  </label>
                  <input
                    className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                    id="password"
                    value={password}
                    type='password'
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </fieldset>
                {/*DataBase*/}
                <fieldset className="mb-[12px] flex items-center gap-5">
                  <label className="text-black w-[90px] text-right text-[15px]" htmlFor="database">
                    Database
                  </label>
                  <input
                    className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                    id="database"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                  />
                </fieldset>
                {/*Proxy CheckBox*/}
                <fieldset className="mb-[12px] flex items-center gap-5">
                  <label className="text-black w-[90px] text-right text-[15px]" htmlFor="checkboxProxy">
                    Use Proxy
                  </label>
                  <input
                    type='checkbox'
                    checked={showSubInputs}
                    onChange={handleCheckboxChange}
                    className="checkbox"
                    id="checkboxProxy"
                  />
                </fieldset>
                {/*Proxy CheckBox*/}
                {showSubInputs && (<div className='card border-2'>
                  <div className="card-body">
                    {/*Proxy Host*/}
                    <fieldset className="mb-[11px] flex items-center gap-4">
                      <label className="text-black w-[90px] text-right text-[14px]" htmlFor="proxyHost">
                        Proxy Host
                      </label>
                      <input
                        className="input input-bordered text-black inline-flex h-[28px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                        id="proxyHost"
                        value={proxyHost}
                        onChange={(e) => setProxyHost(e.target.value)}
                      />
                    </fieldset>
                    {/*Proxy Port*/}
                    <fieldset className="mb-[11px] flex items-center gap-5">
                      <label className="text-black w-[90px] text-right text-[14px]" htmlFor="proxyPort">
                        Proxy Port
                      </label>
                      <input
                        className="input input-bordered text-black inline-flex h-[28px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                        id="proxyPort"
                        value={proxyPort}
                        type='number'
                        min={1}
                        max={65535}
                        onChange={(e) => setProxyPort(parseInt(e.target.value))}
                      />
                    </fieldset>
                    <fieldset className="mb-[11px] flex items-center gap-5">
                      <label className="text-black w-[90px] text-right text-[14px]" htmlFor="username">
                        Username
                      </label>
                      <input
                        className="input input-bordered text-black inline-flex h-[28px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                        id="username"
                        value={proxyUser}
                        onChange={(e) => setProxyUser(e.target.value)}
                      />
                    </fieldset>
                    {/*Auth Type*/}
                    <fieldset className="mb-[11px] flex items-center gap-5">
                      <label className="text-black w-[90px] text-right text-[14px]" htmlFor="authenticationType">
                        Authentication Type
                      </label>
                      <select
                        className="text-black h-[28px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                        id="authenticationType" value={authType} onChange={handleProxyAuthChange}>
                        <option value="none">None</option>
                        <option value="password">Password</option>
                        <option value="privatekey">SSH Key</option>
                      </select>
                    </fieldset>
                    {/*SSH Key*/}
                    {authType === "privatekey" ? (<>
                      <fieldset className="mb-[11px] flex items-center gap-5">
                        <label className="text-black w-[90px] text-right text-[14px]" htmlFor="proxySSHkey">
                          SSH Key
                        </label>
                        <input
                          type="file"
                          className="file-input file-input-bordered flex-1 h-[28px] text-black w-full rounded-lg text-sm focus:z-10 disabled:opacity-50 disabled:pointer-events-none"
                          onChange={async (e) => await handleSSHFileChange(e)}
                          id="proxySSHkey"
                        />
                      </fieldset></>) : (
                      authType === "password" ? (
                        <>
                          <fieldset className="mb-[11px] flex items-center gap-5">
                            <label className="text-black w-[90px] text-right text-[14px]" htmlFor="password">
                              Password
                            </label>
                            <input
                              className="input input-bordered text-black inline-flex h-[28px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                              id="ppassword"
                              type="password"
                              value={proxyAuthData}
                              onChange={(e) => setProxyAuthData(e.target.value)}
                            />
                          </fieldset>
                        </>) : (<></>)
                    )}
                  </div></div>)}</>)}
          </div>
          <div className="modal-action">
            <button className="btn hover:bg-black hover:text-white" onClick={async () => await handleConnect()}>Connect</button>
            <form method="dialog">
              <button className="btn hover:bg-red-600 hover:text-white" onClick={() => setDialogOpen(false)}>Close</button>
            </form>
          </div>

        </div>
      </dialog>
    </>)
};
export default AddDataSourceModel;