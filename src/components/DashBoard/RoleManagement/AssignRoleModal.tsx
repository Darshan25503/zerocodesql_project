"use client";
import { AsyncReturnType } from "@/lib/database/types";
import { User } from "@/lib/manage/user";
import { useRouter } from "next/navigation";
import {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import toast, { Toaster } from "react-hot-toast";

interface AssignRoleModalProps {
  isOpen: boolean,
  onClose: () => void,
  schema: AsyncReturnType<typeof User.getAccessibleEntities>,
  userList?: { id: number, name: string }[],
  editing: boolean,
  editUserState: { id: number, name: string, datasource: number, database: number, table: number, permission: number } | null
}

export const AssignRoleModal = forwardRef<HTMLDialogElement, AssignRoleModalProps>(
  ({ isOpen, onClose, schema, userList, editing, editUserState }, ref) => {
    const [user, setUser] = useState<AssignRoleModalProps['userList'][number]>(editUserState ? { id: editUserState.id, name: editUserState.name } : userList[0]);
    const [permission, setPermission] = useState<number>(editUserState ? editUserState.permission : 2);
    const [dataSource, setDataSource] = useState<number>(editUserState ? editUserState.datasource : schema.values().next().value.id);
    const [database, setDatabase] = useState<number>(editUserState ? editUserState.database : schema.values().next().value.children.values().next().value.id);
    const [table, setTable] = useState<number>(editUserState ? editUserState.table : schema.values().next().value.children.values().next().value.children.values().next().value.id);
    const [currentDatabases, setCurrentDatabases] = useState<{ id: number, name: string }[]>([]);
    const [currentTables, setCurrentTables] = useState<{ id: number, name: string }[]>([]);

    const router = useRouter();

    const setDataSourceFn = (ds: number) => {
      setDataSource(ds);
      setCurrentDatabases([...schema.get(ds).children.values()].map((database) => {
        return {
          id: database.id,
          name: database.display
        }
      }));
      const newDb = schema.get(ds).children.values().next().value.id;
      setDatabase(newDb);
      setCurrentTables([...schema.get(ds).children.get(newDb).children.values()].map((tbl) => {
        return {
          id: tbl.id,
          name: tbl.display
        }
      }));
      setTable(schema.get(ds).children.get(newDb).children.values().next().value.id);
    }

    const setDatabaseFn = (db: number) => {
      setDatabase(db);
      setCurrentTables([...schema.get(dataSource).children.get(db).children.values()].map((tbl) => {
        return {
          id: tbl.id,
          name: tbl.display
        }
      }));
      setTable(schema.get(dataSource).children.get(db).children.values().next().value.id);
    }

    useEffect(() => {
      if (ref && typeof ref !== 'function') {
        const dialog = ref.current as HTMLDialogElement | null;
        if (dialog) {
          if (isOpen) {
            dialog.showModal();
          } else {
            dialog.close();
          }
        }
      }
    }, [isOpen, ref]);

    useEffect(() => {
      setDataSourceFn(schema.values().next().value.id);
    }, []);

    const handleSubmit = async () => {
      try {
        const cols = [...schema.get(dataSource).children.get(database).children.get(table).children.values()].map(x => x.Id);
        await fetch(`/api/user/${user.id}/role`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: "POST",
          body: JSON.stringify(
            cols.map(colData => {
              return {
                datasourceId: dataSource,
                columnId: colData,
                databaseId: database,
                tableId: table,
                permission: permission
              }
            })
          )
        });

        if (editing) {
          toast.success("Role updated successfully!");
        } else {
          toast.success("Role assigned successfully!");
        }
        // onSubmit({ username, permission, dataSource, database, table });
        onClose();
        const refObj = ref as MutableRefObject<HTMLDialogElement>;
        refObj.current.close();
        router.refresh();
      } catch (error) {
        toast.error("An unexpected error occurred.");
      }
    };

    return (
      <>
        <dialog className="modal" ref={ref}>
          <div className="modal-box w-screen">
            <h3 className="font-bold text-lg">{editing ? "Edit Role" : "Assign Permission"}</h3>
            <span>Please enter the role details</span>


            <div className="mt-6">
              {!editing && <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Username
                </label>
                <select
                  className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={user ? user.id : ""}
                  onChange={(e) => setUser(userList.find(x => x.id == parseInt(e.target.value)))}
                >
                  {
                    userList.map((x, i) => {
                      return <option value={x.id} key={i}>{x.name}</option>
                    })
                  }
                </select>
              </fieldset>}

              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Permission
                </label>
                <select
                  className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={permission}
                  onChange={(e) => setPermission(parseInt(e.target.value))}
                >
                  <option value="15">All Access</option>
                  <option value="7">Creator (Create, Read, Update)</option>
                  <option value="6">Editor (Read, Update)</option>
                  <option value="2">Viewer (Read Only)</option>
                </select>
              </fieldset>

              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Data Source
                </label>
                <select
                  className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={dataSource}
                  onChange={(e) => setDataSourceFn(parseInt(e.target.value))}
                  disabled={editing}
                >
                  {
                    [...schema.values()].map((ds) => {
                      return <option key={ds.id} value={ds.id}>{ds.display}</option>
                    })
                  }
                </select>
              </fieldset>

              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Database
                </label>
                <select
                  className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={database}
                  onChange={(e) => setDatabaseFn(parseInt(e.target.value))}
                  disabled={editing}
                >
                  {currentDatabases.map((db) => (
                    <option key={db.id} value={db.id}>{db.name}</option>
                  ))}
                </select>
              </fieldset>

              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="text-black w-[90px] text-right text-[15px]">
                  Table
                </label>
                <select
                  className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                  value={table}
                  onChange={(e) => setTable(parseInt(e.target.value))}
                  disabled={editing}
                >
                  {currentTables.map((tb) => (
                    <option key={tb.id} value={tb.id}>{tb.name}</option>
                  ))}
                </select>
              </fieldset>
            </div>

            <div className="modal-action">
              <button className="btn hover:bg-black hover:text-white " onClick={handleSubmit}>
                {editing ? "Update" : "Assign"}
              </button>
              <form method="dialog">
                <button className="btn hover:bg-red-600 hover:text-white">Close</button>
              </form>
            </div>
          </div>
          <Toaster
            toastOptions={{
              style: {
                zIndex: 10, // Ensure the toast appears above the modal
              },
            }}
          />
        </dialog>
      </>
    );
  }
);

AssignRoleModal.displayName = "AssignRoleModal";
