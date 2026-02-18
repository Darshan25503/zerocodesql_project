import React, { useState } from 'react'
import { LuClipboardEdit } from 'react-icons/lu';
import { FaTrashAlt } from 'react-icons/fa';
import { AsyncReturnType } from '@/lib/database/types';
import { User } from '@/lib/manage/user';
import toast from 'react-hot-toast';
import { IoCloseSharp } from 'react-icons/io5';
import Spinner from '@/components/Layout/Spinner';
import DeletePopupMessage from '@/components/Layout/DeletePopupMessage';

const DataSourceContent = ({ schema }: { schema: AsyncReturnType<typeof User.getAccessibleEntities> }) => {
  //let dataSourceNames = [];
  const [dataSourcesClient, setDataSourceClient] = useState([...schema.values()]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteDataSourceId, setDeleteDataSourceId] = useState(null);
  const [loading, setLoading] = useState(false);

  /*for (const [srcId, src] of schema) {
    dataSourceNames.push({ id: srcId, name: src.name });
  }*/

  const handleDelete = async (id: number) => {
    const ids = [...schema.get(id).children.values()].map(item => item.id);
    setLoading(true);
    await fetch('/api/setting', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setLoading(false);
        setIsDeleteModalOpen(false);
        setDataSourceClient(dataSourcesClient.filter(field => field.id !== id));
        setDeleteDataSourceId(null);
        toast.success(data.message);
      })
      .catch(error => {
        setLoading(false);
        toast.error("Failed to delete form!");
        console.error('Error:', error);
      });
  };

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
          <DeletePopupMessage name={dataSourcesClient.find(ds => ds.id === deleteDataSourceId)?.name} type={'Datasource'} />
          <div className="mt-[20px] flex justify-end">
            <button className="btn btn-md btn-primary hover:btn-error hover:text-white"
              onClick={() => { handleDelete(deleteDataSourceId) }}>
              {loading ? <Spinner /> : <>DELETE</>}
            </button>
          </div>
        </div>
      </dialog>
      <table className="my-5 min-w-full bg-white shadow-md overflow-hidden rounded-lg">
        <thead className='bg-slate-700 text-white'>
          <tr>
            {/* <th className='py-2 px-4 text-l text-center'>Sr No</th> */}
            <th className='py-2 px-4 text-l text-center'>Data Source Name</th>
            <th className='py-2 px-4 text-l text-center'>Action</th>
          </tr>
        </thead>
        <tbody>
          {dataSourcesClient.map((ds, idx) => (
            <tr key={idx}>
              {/* <td className='py-2 px-4 text-l text-center'>{indexOfFirstLead + index + 1}</td> */}
              <td className='py-2 px-4 text-l text-center'>{ds.name}</td>
              <td className='py-2 px-4 text-l text-center'>
                <button
                  className={`btn btn-sm bg-slate-700 text-white hover:text-black mr-2`}
                >
                  <LuClipboardEdit />
                </button>
                <button
                  className={`btn btn-sm bg-slate-500 text-white hover:text-black`}
                  onClick={() => { setIsDeleteModalOpen(true); setDeleteDataSourceId(ds.id); }}
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};

export default DataSourceContent;
