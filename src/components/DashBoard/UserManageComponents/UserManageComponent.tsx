"use client";
import { useEffect, useRef, useState } from 'react';
import { FaUserPlus } from "react-icons/fa6";
import { FaTrashAlt } from 'react-icons/fa';
import { LuClipboardEdit } from "react-icons/lu";
import toast, { Toaster } from 'react-hot-toast';
import Spinner from '@/components/Layout/Spinner';
import DeletePopupMessage from '@/components/Layout/DeletePopupMessage';
import { IoCloseSharp } from 'react-icons/io5';

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

type Role = {
  Id: number;
  Name: string;
  Color: string;
}

const UserManageComponent: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string }>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 5;
  const [totalPages, setTotalPages] = useState(1);
  const indexOfLastLead = currentPage * rowsPerPage;
  const indexOfFirstLead = indexOfLastLead - rowsPerPage;

  useEffect(() => {
    setTotalPages(Math.max(1, Math.ceil(users.length / rowsPerPage)));
    setCurrentPage(Math.min(Math.max(1, currentPage), totalPages));
  }, [users]);

  useEffect(() => {
    if (!isAddModalOpen) {
      setIsEditing(false);
    }
  }, [isAddModalOpen]);

  const validate = () => {
    let valid = true;
    let errors: { fullName?: string; email?: string; password?: string } = {};
    if (!currentUser?.Email) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(currentUser?.Email)) {
      errors.email = 'Email is invalid';
      valid = false;
    }
    setErrors(errors);
    return valid;
  };

  const fetchData = async () => {
    try {
      const uresponse = await fetch('/api/user/list').then(d => d.json());
      setUsers(uresponse);

      setTotalPages(Math.max(1, Math.ceil(users.length / rowsPerPage)));
      setCurrentPage(Math.min(Math.max(1, currentPage), totalPages));

      const rresponse = await fetch('/api/role/list').then(d => d.json());
      setRoles(rresponse);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddUser = () => {
    setCurrentUser({
      id: 0, Username: '', Email: '', isSuperAdmin: false, Role: roles[0]
    });
    setPassword('');
    setIsAddModalOpen(true);
    setSubmitting(false);
  };

  const setUserRole = (roleId: number) => {
    if (currentUser) {
      let role = roles.find(x => x.Id == roleId);
      setCurrentUser({ ...currentUser, Role: role });
    }
  }

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsEditing(true);
    setIsAddModalOpen(true);
    setPassword('********')
  };


  const handleDeleteUser = async (userId: number) => {
    setLoading(true);
    try {
      const data = {
        id: userId
      }
      const response = await fetch('/api/user', {
        method: "DELETE",
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(d => d.json());
      if (response) {
        setLoading(false);
        setDeleteUserId(null);
        setIsDeleteModalOpen(false);
        await fetchData();
        toast.success("Deleted");
      }
    } catch (error) {
      setLoading(false);
      toast.error("Error");
      console.error('Error fetching users:', error);
    }
  };

  const handleSaveUser = async () => {
    if (currentUser) {

      const { Username, Email } = currentUser;

      if (!Username || !Email || (!isEditing && !password)) {
        toast.error("Please fill in all required fields.");
        return;
      }

      if (!validate()) {
        toast.error("Email is invalid")
        return;
      }

      try {
        setSubmitting(true);
        let submitBody = JSON.stringify(
          isEditing ? {
            id: currentUser.id,
            Username: currentUser.Username,
            Email: currentUser.Email,
            password: password !== '********' ? password : undefined,
            isSuperAdmin: currentUser.isSuperAdmin,
            Role_id: currentUser.Role.Id,
          } : {
            Username: currentUser.Username,
            Email: currentUser.Email,
            password: password,
            isSuperAdmin: currentUser.isSuperAdmin,
            Role_id: currentUser.Role.Id
          }
        )
        const response = await fetch('/api/user/add', {
          method: isEditing ? "PATCH" : "POST",
          body: submitBody,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(d => d.json());
        if (response.success) {
          setSubmitting(false);
          toast.success(isEditing ? "Updated user data" : "Added new user");
          await fetchData();
        } else {
          setSubmitting(false);
          toast.error("Failed to save user");
        }
      } catch (error) {
        console.error('Error saving user:', error);
        toast.error("Error saving user");
      }
    }
    setSubmitting(false);
    setIsAddModalOpen(false);
    setIsEditing(false);
  };

  const handleChangePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const paginatedUsers = users.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <div><dialog className={isDeleteModalOpen ? "modal modal-open" : "modal"}>
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
        <DeletePopupMessage name={paginatedUsers.find(user => user.id === deleteUserId)?.Username} type={'User'} />
        <div className="mt-[20px] flex justify-end">
          <button className="btn btn-md btn-primary hover:btn-error hover:text-white"
            onClick={() => { handleDeleteUser(deleteUserId) }}>
            {loading ? <Spinner /> : <>DELETE</>}
          </button>
        </div>
      </div>
    </dialog>
      <div className="p-4 text-black">
        <Toaster />
        <div className='mb-6 rounded-md bg-slate-100 p-5'>
          <h1 className="text-xl font-bold">User Management</h1>
          <p className="text-justify my-5 text-sm">This section allows you to manage user accounts effectively.
            You can create new users, edit existing user details,
            including making a user a Super Admin with elevated permissions.
            Additionally, you have the ability to remove users when necessary.
            This ensures that you maintain control over who has access to your system
            and can tailor user permissions to meet your organization&apos;s needs.</p>

          <div className='mb-5 rounded-md bg-slate-100 p-1'>
            <div className="flex justify-between mb-4">
              <h1 className="text-xl font-bold">User Settings</h1>
              <button
                className="bg-gray-700 text-white py-2 px-4 rounded flex items-center"
                onClick={handleAddUser}
              >
                <FaUserPlus /> <span className="ml-2">Add New User</span>
              </button>
            </div>

            <table className="table table-auto bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-slate-700 text-white">
                <tr>
                  <th className='text-center'>Sr No</th>
                  <th className="text-center">Name</th>
                  <th className="text-center">Email</th>
                  <th className="text-center">Is Super Admin</th>
                  <th className="text-center">Role</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td className='text-center'>{indexOfFirstLead + index + 1}</td>
                    <td className="text-center">{user.Username}</td>
                    <td className="text-center">{user.Email}</td>
                    <td className="text-center">{user.isSuperAdmin ? 'Yes' : 'No'}</td>
                    <td className="text-center">{user.Role.Name}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm bg-slate-700 text-white hover:text-black mr-2"
                        onClick={() => handleEditUser(user)}
                      >
                        <LuClipboardEdit />
                      </button>
                      <button
                        className={`btn btn-sm bg-slate-500 text-white hover:text-black ${user.isSuperAdmin ? 'btn-disabled' : ''}`}
                        onClick={() => { setDeleteUserId(user.id); setIsDeleteModalOpen(true) }}
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
                  className="btn-sm mr-6 rounded-md bg-slate-700 text-white"
                  onClick={() => handleChangePage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="ml-6 btn-sm rounded-md bg-slate-700 text-white"
                  onClick={() => handleChangePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
              <p className='font-bold'>Total Users: {users.length}</p>
            </div>
          </div>
        </div>
        {/* Add User Modal */}
        <dialog className={isAddModalOpen ? "modal modal-open" : "modal"}>
          <div className="modal-box">
            <h3 className="text-lg font-bold">{isEditing ? 'Edit User' : 'Add User'}</h3>
            <div className="mt-2">
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Name
                </label>
                <input
                  className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={currentUser?.Username || ''}
                  onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, Username: e.target.value } : null)}
                />
              </fieldset>

              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Email
                </label>
                <input
                  className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={currentUser?.Email || ''}
                  disabled={isEditing}
                  onChange={(e) => { setCurrentUser(currentUser ? { ...currentUser, Email: e.target.value } : null) }}
                />
              </fieldset>
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Password
                </label>
                <input
                  type="password"
                  disabled={isEditing}
                  className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </fieldset>
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Super Admin
                </label>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={currentUser?.isSuperAdmin || false}
                  onChange={(e) => setCurrentUser(currentUser ? { ...currentUser, isSuperAdmin: e.target.checked } : null)}
                />
              </fieldset>
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Role
                </label>
                <select
                  onChange={(e) => setUserRole(parseInt(e.target.value))}
                  className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none">
                  {roles.map(role => (
                    <option key={role.Id} value={role.Id}>{role.Name}</option>
                  ))}
                </select>
              </fieldset>
            </div>
            <div className="modal-action">
              <button className="btn hover:bg-black hover:text-white "
                disabled={isSubmitting}
                onClick={handleSaveUser}>{isSubmitting ? (<><Spinner /></>) : isEditing ? "Save" : "Create"}</button>
              <form method="dialog">
                <button className="btn hover:bg-red-500 hover:text-white" onClick={() => setIsAddModalOpen(false)}>Close</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default UserManageComponent;
