"use client";
import { AsyncReturnType } from '@/lib/database/types';
import { Form } from '@/lib/manage/form';
import { User } from '@/lib/manage/user';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaTrashAlt } from 'react-icons/fa';
import { LuClipboardEdit } from "react-icons/lu";
import { MdOutlineCopyAll } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import Spinner from '@/components/Layout/Spinner';
import { IoCloseSharp } from 'react-icons/io5';
import DeletePopupMessage from '@/components/Layout/DeletePopupMessage';



interface FormDataDashboardProps {
  schema: AsyncReturnType<typeof User.getAccessibleEntities>
  forms: AsyncReturnType<typeof Form.listForms>
}

const FormDataDashBoard = (props: FormDataDashboardProps) => {
  const [formState, setFormState] = useState(props.forms);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [enableActions, setEnableActions] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteFormId, setDeleteFormId] = useState(null);
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const indexOfLastLead = currentPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;
  const currentForms = formState.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(props.forms.length / itemsPerPage);

  const handleDelete = async (id: number) => {
    setLoading(true);
    await fetch('/api/form', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id }),
    })
      .then(response => response.json())
      .then(data => {
        setLoading(false);
        setIsDeleteModalOpen(false);
        setDeleteFormId(null);
        setFormState(formState.filter(field => field.id !== id));
        toast.success(data.message);
      })
      .catch(error => {
        setLoading(false);
        toast.error("Failed to delete form!");
        console.error('Error:', error);
      });

    // setLeads(leads.filter(lead => lead.id !== id));
  };

  const handleCopy = (ln: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/shareform/${ln}`);
    toast.success("Link Copied");
  }

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    const response = await fetch('/api/form', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: id,
        enabled: !newStatus,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      let text = newStatus ? "Form is Disabled" : "Form is Enabled";
      toast.success(text);
      setFormState(prev => prev.map(form => form.id === id ? { ...form, enabled: !form.enabled } : form));
    } else {
      toast.error('Failed to modify form status!');
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
  }, [formState])

  return (<div>
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
        <DeletePopupMessage name={currentForms.find(form => form.id === deleteFormId)?.name} type={'Form'} />
        <div className="mt-[20px] flex justify-end">
          <button className="btn btn-md btn-primary hover:btn-error hover:text-white"
            onClick={() => { handleDelete(deleteFormId) }}>
            {loading ? <Spinner /> : <>DELETE</>}
          </button>
        </div>
      </div>
    </dialog>
    <div className="m-5 rounded-md bg-slate-100 p-5">
      <h1 className="text-xl font-bold">Form Management</h1>
      <p className="text-justify my-5 text-sm">This section allows users to manage their forms with ease.
        You can create, edit, and delete forms as needed. Additionally,
        you can enable or disable forms to control their availability.
        This functionality gives you complete control over your forms, ensuring they are tailored to your
        specific requirements and are available when needed.</p>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Your Forms Settings</h2>
        <button
          className={`py-2 px-4 rounded-md ${enableActions ? 'bg-slate-700 text-white' : 'bg-slate-300 text-slate-800'}`}
          onClick={() => setEnableActions(!enableActions)}
        >
          {enableActions ? 'Disable Actions' : 'Enable Actions'}
        </button>
      </div>
      <table className="table table-auto shadow-md overflow-hidden rounded-lg bg-white">
        <thead className='bg-slate-700 text-white'>
          <tr>
            <th className='text-center'>Sr No</th>
            <th className='text-center'>Name</th>
            <th className='text-center'>Title</th>
            <th className='text-center'>Form Link</th>
            <th className='text-center'>Status</th>
            <th className='text-center'>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentForms.map((form, index) => (
            <tr key={form.id}>
              <td className='text-center'>{indexOfFirstLead + index + 1}</td>
              <td className='text-center'>{form.name}</td>
              <td className='text-center'>{form.title}</td>
              <td className='text-center justify-center flex mt-[3px] align-middle'>
                <p className='max-w-64 mt-1 overflow-hidden'>{`${window.location.origin}/shareform/${form.shareString}`}</p><span className='mt-1'>....</span>
                <button className='ml-2 mt-1' onClick={() => { handleCopy(form.shareString) }}><MdOutlineCopyAll size={15} /></button>
              </td>
              <td className='text-center'><div className={`badge badge-success gap-2 ${form.enabled ? 'badge-success' : 'badge-error'} w-20 text-white`}>{form.enabled ? "Active" : "Inactive"}</div></td>
              <td className='text-center'>
                <a href={pathname + "/" + form.id}>
                  <button
                    className={`btn btn-sm bg-slate-700 text-white hover:text-black mr-2 ${enableActions ? '' : 'btn-disabled'}`}
                    disabled={!enableActions}
                  >
                    <LuClipboardEdit />
                  </button>
                </a>
                <button
                  className={`btn btn-sm bg-slate-500 text-white hover:text-black mr-2 ${enableActions ? '' : 'btn-disabled'}`}
                  onClick={() => { setIsDeleteModalOpen(true); setDeleteFormId(form.id) }}
                  disabled={!enableActions}
                >
                  <FaTrashAlt />
                </button>
                <a className={`btn btn-sm bg-slate-500 text-white hover:text-black mr-2 ${enableActions ? '' : 'btn-disabled'} ${form.enabled ? '' : 'btn-disabled'}`}
                  href={`${window.location.origin}/shareform/${form.shareString}`} target='_blank'>
                  <button><FaRegEye size={15} /></button>
                </a>
                <button className='align-middle'>
                  <input type="checkbox" className="toggle toggle-success"
                    checked={form.enabled} onClick={(e) => { handleToggleStatus(form.id, form.enabled) }} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <div>
          <button
            className="btn-sm mr-6 rounded-md bg-slate-700 text-white"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="ml-6 btn-sm rounded-md bg-slate-700 text-white"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(formState.length / itemsPerPage)}
          >
            Next
          </button>
        </div>
        <p className='font-bold'>Total Forms: {formState.length}</p>
      </div>
    </div></div>
  );
};

export default FormDataDashBoard;
