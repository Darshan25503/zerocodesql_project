"use client";
import { useState, useRef, MutableRefObject } from "react";
import { Toaster, toast } from "react-hot-toast";
import Link from "next/link";
import { BsShieldFillPlus } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { LuClipboardEdit } from "react-icons/lu";
import { FaTrashAlt } from "react-icons/fa";
import { MdAssignmentInd } from "react-icons/md";
import { MdAssignmentAdd } from "react-icons/md";
import { MdAssignment } from "react-icons/md";
import { AssignRoleModal } from "./AssignRoleModal";
import { AsyncReturnType } from "@/lib/database/types";
import { User } from "@/lib/manage/user";

interface RolesState {
  roles: {
    id: number;
    name: string;
  }[],
  schema: AsyncReturnType<typeof User.getAccessibleEntities>,
  userList: { id: number, name: string }[],
  userCount: number,

}

const RolesPage = (state: RolesState) => {
  const router = useRouter();
  const dialogRef = useRef(null);

  const [roles, setRoles] = useState(state.roles);
  const [userCount, setUserCount] = useState(state.userCount);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [curPage, setCurPage] = useState(1);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [itemsPerPage] = useState(5);
  const indexOfLastLead = curPage * itemsPerPage;
  const indexOfFirstLead = indexOfLastLead - itemsPerPage;

  const handleDeleteRole = async (roleId: number) => {
    await fetch("/api/role", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roleId: roleId,
      }),
    })
    setRoles(roles.filter((role) => role.id !== roleId));
    toast.success("Role deleted");
  };

  const handleAddRole = async () => {
    if (newRoleName.trim() === "") {
      toast.error("Role name cannot be empty");
      return;
    }

    let data = await fetch("/api/role", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newRoleName,
      }),
    }).then(x => x.json());

    setRoles([...roles, { id: data.roleId, name: newRoleName }]);
    setNewRoleName("");
    setIsModalOpen(false);
    toast.success("Role added");
    router.push(`/dashboard/roles/edit/${data.roleId}`);
  };

  const totalPages = Math.ceil(roles.length / itemsPerPage);

  const curRoles = roles.slice(
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

  const setAssignModalState = (state: boolean) => {
    setIsAssignModalOpen(state);
    const refObj = dialogRef as MutableRefObject<HTMLDialogElement>;
    if (state) {
      refObj.current?.showModal();
    } else {
      refObj.current.close();
    }
  }

  return (
    <div className="pb-4 pl-4 pr-4 text-black">
      <Toaster />
      <div className="grid lg:grid-cols-5 sm:grid-cols-2 gap-1 justify-evenly">
        <button className='relative flex flex-col ml-0 my-6 mr-6 text-gray-700 bg-gray-200 shadow-md hover:shadow-xl transition 300 bg-clip-border rounded-xl w-50' onClick={() => { setIsModalOpen(true) }}>
          <div><BsShieldFillPlus size="30" className='ml-4 mt-4' /></div>
          <p className='m-4 text-m '>Add New Role</p>
        </button>
        <button className='relative flex flex-col ml-0 my-6 mr-6 text-gray-700 bg-gray-200 shadow-md hover:shadow-xl transition 300 bg-clip-border rounded-xl w-50' onClick={() => {
          setAssignModalState(true);
        }}>
          <div><MdAssignmentAdd size="30" className='ml-4 mt-4' /></div>
          <p className='m-4 text-m '>Assign a Permission</p>
        </button>
        <button className='relative flex flex-col ml-0 my-6 mr-6 text-gray-700 bg-gray-200 shadow-md hover:shadow-xl transition 300 bg-clip-border rounded-xl w-50' onClick={() => { router.push('/dashboard/roles/assigned') }}>
          <div><MdAssignment size="30" className='ml-4 mt-4' /></div>
          <p className='m-4 text-m '>Assigned Permissions</p>
        </button>

        <div className="relative flex mt-5 h-26 items-center justify-between mb-3 md:mx-3 sm:ml-2 p-3 text-gray-700 bg-white rounded-xl ">
          <div className='py-2'>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 md:text-base">{`Total Roles`}</p>
            <h2 className="text-gray-800 text-xl sm:text-2xl md:text-3xl font-bold">{roles.length}</h2>
          </div>
          <div className="w-10 rounded-full flex items-center justify-center">
            <MdAssignmentInd size="42" />
          </div>
        </div>
        <div className="relative flex mt-5 h-26 items-center justify-between mb-3 md:mx-3 sm:ml-2 p-3 text-gray-700 bg-white rounded-xl ">
          <div className='py-2'>
            <p className="text-gray-500 text-xs sm:text-sm mb-3 md:text-base">{`Total Assigned Roles`}</p>
            <h2 className="text-gray-800 text-xl sm:text-2xl md:text-3xl font-bold">{userCount}</h2>
          </div>
          <div className="w-10 rounded-full flex items-center justify-center">
            <MdAssignmentInd size="42" />
          </div>
        </div>
      </div>
      <div className="rounded-md bg-slate-100 p-5">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-bold">Role Management</h1>

        </div>
        <p className="text-justify my-5 text-sm">The Role Management Dashboard allows administrators to view, create, edit,
          and delete user roles within the system. Admins can add new roles to customize access levels and
          modify existing ones to align with changing needs. However, it&apos;s important to note that default roles are essential
          to system functionality and cannot be edited or deleted.
          This safeguard ensures the system remains stable and consistent.</p>
        <table className="table table-auto bg-white shadow-md overflow-hidden rounded-lg">
          <thead className="bg-slate-700 text-white">
            <tr>
              <th className='text-center'>Sr No</th>
              <th className="text-center">Role Name</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {curRoles.map((role, index) => (
              <tr key={role.id}>
                <td className='text-center'>{indexOfFirstLead + index + 1}</td>
                <td className="text-center">{role.name}</td>
                <td className="text-center">
                  <Link href={`/dashboard/roles/edit/${role.id}`} className={`${role.name == "Default" ? "btn-disabled" : ""}`}>
                    <button className={`btn btn-sm bg-slate-700 text-white hover:text-black mr-2 ${role.name == "Default" ? "btn-disabled" : ""}`}>
                      <LuClipboardEdit />
                    </button>
                  </Link>
                  <button
                    className={`btn btn-sm bg-slate-500 text-white hover:text-black ${role.name == "Default" ? "btn-disabled" : ""}`}
                    onClick={async () => await handleDeleteRole(role.id)}
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
          <p className='font-bold'>Total Roles: {roles.length}</p>
        </div>
      </div>
      {isModalOpen && (<>
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Add New Role</h2>
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-[15px]">
                  Role Name
                </label>
              </fieldset>
              <input
                type="text"
                className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] pr-[10px] text-[15px] leading-none overflow-hidden text-ellipsis"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <div className="modal-action">
                <button className="btn hover:bg-black hover:text-white " onClick={async () => await handleAddRole()}>
                  Add Role
                </button>
                <form method="dialog">
                  <button className="btn hover:bg-red-600 hover:text-white"
                    onClick={() => setIsModalOpen(false)}>Cancel</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </>
      )}
      {
        isAssignModalOpen && <AssignRoleModal
          ref={dialogRef}
          isOpen={isAssignModalOpen}
          onClose={() => setAssignModalState(false)}
          schema={state.schema}
          userList={state.userList}
          editing={false}
          editUserState={null}
        />
      }
    </div >
  );
};

export default RolesPage;
