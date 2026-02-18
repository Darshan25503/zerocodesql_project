"use client";
import React, { useEffect, useState, useRef, MutableRefObject } from 'react';
import { useRouter } from "next/navigation";
import { FaTrashAlt } from 'react-icons/fa';
import { LuClipboardEdit } from "react-icons/lu";
import { MdAssignmentInd } from "react-icons/md";
import { AssignRoleModal } from './AssignRoleModal';
import { AsyncReturnType } from '@/lib/database/types';
import { User } from '@/lib/manage/user';
import { Role } from '@/lib/manage/role';

interface AssignedRolesProps {
  schema: AsyncReturnType<typeof User.getAccessibleEntities>,
  userList: { id: number, name: string }[],
  viewState: AsyncReturnType<typeof Role.getUserPermissionsViewState>
}

export default function AssignedRoles(props: AssignedRolesProps) {
  const router = useRouter();
  const dialogRef = useRef(null);

  const [currentSlice, setCurrentSlice] = useState(props.viewState);
  const [isAddModalAssignRole, setIsAddModalAssignRole] = useState(false);
  const [curPage, setCurPage] = useState(1);
  const [itemsPerPage] = useState(2);
  const [isEditing, setEditing] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  const indexOfLastLead = curPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;

  const handleDelete = async (id: number, datasource: number, database: number, table: number) => {
    await fetch(`/api/user/${id}/role`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: "DELETE",
      body: JSON.stringify({
        datasourceId: datasource,
        databaseId: database,
        tableId: table,
      })
    });
    location.reload();
  };

  const setAssignModalState = (state: boolean) => {
    setIsAddModalAssignRole(state);
    const refObj = dialogRef as MutableRefObject<HTMLDialogElement>;
    if (state) {
      refObj.current?.showModal();
    } else {
      refObj.current.close();
    }
  }

  const handleEdit = (id: number, datasource: number, database: number, table: number, permissions: number) => {
    setCurrentEditUser({ id: id, name: props.userList.find(x => x.id === id).name, datasource: datasource, database: database, table: table, permissions: permissions });
    setEditing(true);
    setAssignModalState(true);
  }

  const totalPages = Math.ceil(currentSlice.length / itemsPerPage);

  const currentAssignedRoles = currentSlice.slice(
    (curPage - 1) * itemsPerPage,
    curPage * itemsPerPage
  );

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

  const formatPermissionFlags = (flags: number) => {
    switch (flags) {
      case 1:
        return "Create";
      case 2:
        return "Viewer (Read Only)";
      case 3:
        return "Create, Read";
      case 4:
        return "Update";
      case 5:
        return "Create, Update";
      case 6:
        return "Editor (Read, Update)";
      case 7:
        return "Creator (Create, Read, Update)";
      case 8:
        return "Delete";
      case 9:
        return "Create, Delete";
      case 10:
        return "Read, Delete";
      case 11:
        return "Create, Read, Delete";
      case 12:
        return "Update, Delete";
      case 13:
        return "Create, Update, Delete";
      case 14:
        return "Read, Update, Delete";
      case 15:
        return "All Access";
      default:
        return "None";
    }
  }

  const handleModalClose = () => {
    setIsAddModalAssignRole(false);
  };

  return (
    <div className="mt-2 rounded-md bg-slate-100 p-5">
      <h1 className="text-xl font-bold">Assigned User Permissions</h1>
      <p className="text-justify my-5 text-sm">This section displays the permissions assigned to each user within your system.
        With the Assign Permission button, administrators can easily assign new permissions to users,
        as well as edit or delete existing permissions. This functionality ensures that each user
        has the appropriate permissions and access levels tailored to their responsibilities.</p>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Assigned Permisions Settings</h2>
        <div className="flex space-x-4">
          <button
            className="bg-gray-700 text-white py-2 px-4 rounded flex items-center"
            onClick={() => {
              setEditing(false);
              setIsAddModalAssignRole(true);
              dialogRef.current?.showModal();
            }}
          >
            <MdAssignmentInd /> <span className="ml-2">Assign Permission</span>
          </button>
        </div>
      </div>
      <table className="table table-auto bg-white shadow-md overflow-hidden rounded-lg">
        <thead className='bg-slate-700 text-white'>
          <tr>
            <th className='text-center'>Sr No</th>
            <th className='text-center'>Name</th>
            <th className='text-center'>Data Source</th>
            <th className='text-center'>Database</th>
            <th className='text-center'>Table</th>
            <th className='text-center'>Permission</th>
            <th className='text-center'>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentAssignedRoles.map((form, index) => (
            <tr key={index}>
              <td className='text-center'>{indexOfFirstLead + index + 1}</td>
              <td className='text-center'>{form.username}</td>
              <td className='text-center'>{props.schema.get(form.datasourceId).display}</td>
              <td className='text-center'>{props.schema.get(form.datasourceId).children.get(form.databaseId).display}</td>
              <td className='text-center'>{props.schema.get(form.datasourceId).children.get(form.databaseId).children.get(form.tableId).display}</td>
              <td className='text-center'>{formatPermissionFlags(form.permissionFlags)}</td>
              <td className='text-center'>
                <button
                  className={`btn btn-sm bg-slate-700 text-white hover:text-black mr-2`}
                  onClick={() => handleEdit(form.userId, form.datasourceId, form.databaseId, form.tableId, form.permissionFlags)}
                >
                  <LuClipboardEdit />
                </button>
                <button
                  className={`btn btn-sm bg-slate-500 text-white hover:text-black`}
                  onClick={async () => await handleDelete(form.userId, form.datasourceId, form.databaseId, form.tableId)}
                >
                  <FaTrashAlt />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <div>
          <button
            className="mr-6 py-1 px-4 rounded-md bg-slate-700 text-white"
            onClick={handlePreviousPage}
            disabled={curPage === 1}
          >
            Previous
          </button>
          <span>
            Page {curPage} of {totalPages}
          </span>
          <button
            className="ml-6 py-1 px-4 rounded-md bg-slate-700 text-white"
            onClick={handleNextPage}
            disabled={curPage === totalPages}
          >
            Next
          </button>
        </div>
        <p className='font-bold'>Total User Permissions Assigned: {currentSlice.length}</p>
      </div>
      {isAddModalAssignRole && <AssignRoleModal
        ref={dialogRef}
        isOpen={isAddModalAssignRole}
        onClose={handleModalClose}
        schema={props.schema}
        userList={props.userList}
        editing={isEditing}
        editUserState={currentEditUser}
      />}
    </div>
  )
}
