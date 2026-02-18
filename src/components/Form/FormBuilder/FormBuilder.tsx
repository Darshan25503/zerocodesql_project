"use client";
import React, { useEffect, useState } from 'react';
import { AiOutlineForm } from 'react-icons/ai';
import { IoCloseSharp } from "react-icons/io5";
import { Id } from '@/lib/manage/types';
import { getCookies } from 'cookies-next';
import prisma from '../../../../prisma/client';
import { User } from '@/lib/manage/user';
import { useRouter } from 'next/navigation';
import { AsyncReturnType } from '@/lib/database/types';
import { Form } from '@/lib/manage/form';
import { DatabaseColumn, DatabaseEntity, DatabaseTable } from "@/lib/database/types";
import { FaStarOfLife } from 'react-icons/fa';
import Spinner from '@/components/Layout/Spinner';
import toast, { Toaster } from 'react-hot-toast';

interface FormBuilderProps {
  id: number;
  schema: AsyncReturnType<typeof User.getAccessibleEntities>,
}

interface FormField {
  database: number;
  table: number;
  column: number;
  valueOrDescription: string;
  visible: boolean;
}

const FormBuilder: React.FC<FormBuilderProps> = (props: FormBuilderProps) => {
  const [title, setTitle] = useState('');
  const [titleError, setTileError] = useState(false);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState(false);
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [dataSource, setDataSource] = useState<number>(props.schema.keys().next().value);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentDatabases, setCurrentDatabases] = useState<{ id: number, name: string }[]>([]);
  const [selectedDatabases, setSelectedDatabases] = useState<number[]>([]);
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [finalDataSet, setFinalDataset] = useState<FormField[]>([]);
  const [dataEmptyError, setDataEmptyError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDatabaseChange = (db: number,) => {
    setSelectedDatabases(prev =>
      prev.includes(db) ? prev.filter(d => d !== db) : [...prev, db]
    );
  };

  const handleTableChange = (database: number, table: number, checked: boolean) => {

    setSelectedTables(prev =>
      prev.includes(table) ? prev.filter(t => t !== table) : [...prev, table]
    );

    if (checked) {
      // Add
      const cols = [...props.schema.get(dataSource).children.get(database).children.get(table).children.values()].filter(x => !x.isPrimaryKey); // Don't add primary keys!
      setFinalDataset((prevArray) => [...prevArray, ...cols.map((item) => { return { database: database, table: table, column: item.Id, valueOrDescription: item.Display, visible: true } })]);
    } else {
      // Remove
      setFinalDataset((prevArray) => prevArray.filter((item) => !(item.database === database && item.table === table)))
    }
    //console.log([...props.schema.get(dataSource).children.get(database).children.get(table).children.values()])
  };

  const dataSources = [...props.schema.values()];
  const id = props.id;

  const createNewForm = async () => {
    let record = {
      title: title,
      name: name,
      userId: id,
      dataSource: dataSource,
      fields: finalDataSet
    }
    //console.log(finalDtaSet);
    const response = await fetch('/api/form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
    const data = await response.json();
    if (data.success) {
      setTileError(false);
      setNameError(false);
      setDescriptionError(false);
      setLoading(false);
      setDataEmptyError(false);
      setIsAddModalOpen(false);
      const sLink = `/dashboard/form/${data.id}`;
      router.push(sLink);
      toast.success(data.message);
    } else {
      setLoading(false)
      toast.error(data.error);
      console.error('Failed to create form:', data.error);
    }
  };


  const handleSubmitForm = async () => {

    if (title == "" || description == "" || name == "" || finalDataSet.length == 0) {
      if (title == "")
        setTileError(true);
      if (description == "")
        setDescriptionError(true);
      if (name == "")
        setNameError(true);
      if (finalDataSet.length == 0)
        setDataEmptyError(true);
    }
    else {
      setLoading(true);
      createNewForm();
    }
  }

  useEffect(() => {
    if (props.schema != null) {
      const dataSourceObject = props.schema.get(dataSource);
      const children = dataSourceObject?.children ?? new Map(); // Default to an empty Map if children is undefined
      setCurrentDatabases([...children.values()].map(x => { return { id: x.id, name: x.name } }));
    }
  }, [dataSource]);


  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
      />
      <button className='relative flex flex-col m-6 text-gray-700 bg-gray-200 shadow-md hover:shadow-xl transition 300 bg-clip-border rounded-xl w-60' onClick={() => { setIsAddModalOpen(true) }}>
        <div><AiOutlineForm size="30" className='ml-4 mt-4' /></div>
        <p className='m-4 text-m '>New Form</p>
      </button>
      <dialog className={isAddModalOpen ? "modal modal-open" : "modal"}>
        <div className="modal-box">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label="Close"
              onClick={() => { setIsAddModalOpen(false) }}
            >
              <IoCloseSharp />
            </button>
          </form>
          <h1 className="text-lg font-bold">
            Create New Form
          </h1>
          <span>Please enter the form details and select the target columns of the form</span>
          <div className="mt-4">
            <fieldset className="mb-[12px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]" htmlFor="databaseName">
                Name
              </label>
              <input
                className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {
                nameError &&
                (<p className="text-red-500"><FaStarOfLife size="10" /></p>)
              }
            </fieldset>
            <fieldset className="mb-[12px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]" htmlFor="databaseName">
                Title
              </label>
              <input
                className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {
                titleError &&
                (<p className="text-red-500"><FaStarOfLife size="10" /></p>)
              }
            </fieldset>
            <fieldset className="mb-[12px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]" htmlFor="databaseName">
                Description
              </label>
              <input
                className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {
                descriptionError &&
                (<p className="text-red-500"><FaStarOfLife size="10" /></p>)
              }
            </fieldset>
            <div className="mt-4">
              <label className="block text-sm font-medium text-black">
                Select Data Source
              </label>
              <select
                className="mt-1 select select-bordered w-full"
                value={dataSource}
                onChange={(e) => {
                  setDataSource(parseInt(e.target.value));
                  setSelectedDatabases([]);  // Reset selected databases when data source changes
                  setSelectedTables([]);    // Reset selected tables when data source changes
                }}
              >
                <option value="">Select a Data Source</option>
                {dataSources.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.display}
                  </option>
                ))}
              </select>
            </div>
            {dataSource && (
              <div className="space-y-3 mt-3">

                <div className="collapse bg-base-200">
                  <input type="checkbox" />
                  <div className="collapse-title">Select Databases</div>
                  <div className="collapse-content max-h-60 overflow-y-auto">
                    <div className="flex flex-col gap-2 p-2">
                      {currentDatabases.map((db) => (
                        <div key={db.id} className="flex flex-col items-start ml-2">
                          <div className='flex flex-row'>
                            <input
                              type="checkbox"
                              id={`db-${db}`}
                              checked={selectedDatabases.includes(db.id)}
                              onChange={() => handleDatabaseChange(db.id)}
                              className="mr-2 checkbox"
                            />
                            <label htmlFor={`db-${db.id}`} className="text-sm font-medium text-black">
                              {db.name}
                            </label></div>
                          {selectedDatabases.includes(db.id) && (
                            <div className="ml-4 flex flex-col gap-2 p-2">
                              {[...props.schema.get(dataSource).children.get(db.id).children.values()].map((table) => (
                                <div key={table.id} className="flex flex-row">
                                  <input
                                    type="checkbox"
                                    id={`table-${table.id}`}
                                    checked={selectedTables.includes(table.id)}
                                    onChange={(e) => handleTableChange(db.id, table.id, e.target.checked)}
                                    className="mr-2 checkbox"
                                  />
                                  <label htmlFor={`table-${table}`} className="text-sm font-medium text-black">
                                    {table.display}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {dataEmptyError &&
                  (<p className="text-red-500 ml-3 text-sm">No Table Selected</p>)}
              </div>
            )}
          </div>
          <div className="mt-[20px] flex justify-end">
            <button className="btn btn-primary"
              onClick={handleSubmitForm}>
              {loading ? <Spinner /> : <>Submit</>}
            </button>
          </div>
        </div></dialog>
    </>
  );
};

export default FormBuilder;
