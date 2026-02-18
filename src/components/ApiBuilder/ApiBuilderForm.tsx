"use client";
import { ForwardedRef, forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";
import ApiKeyPopup from "./ApiKeyPopup";
import { User } from "@/lib/manage/user";
import { AsyncReturnType } from "@/lib/database/types";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from 'next/navigation'

interface ApiBuilderProps {
  schema: AsyncReturnType<typeof User.getAccessibleEntities>,
  editing: boolean,
  targetId?: number,
  name?: string,
  apiPath?: string,
  dataSource?: number,
  database?: number,
  table?: number,
  methods?: string[],
  isPrivate?: boolean,
  apiKey?: string,
  columns?: number[],
}

export const ApiBuilderForm = forwardRef<HTMLDialogElement, ApiBuilderProps>((props: ApiBuilderProps, ref: ForwardedRef<HTMLDialogElement>) => {
  const [name, setName] = useState<string>(props.name ?? "");
  const [apiPath, setApiPath] = useState<string>(props.apiPath ?? "");
  const [dataSource, setDataSource] = useState<number>(props.dataSource ?? props.schema.keys().next().value);
  const [database, setDatabase] = useState<number>(props.database ?? -1);
  const [table, setTable] = useState<number>(props.table ?? -1);
  const [methods, setMethods] = useState<string[]>(props.methods ?? []);
  const [isPrivate, setIsPrivate] = useState<boolean>(props.isPrivate ?? false);
  const [apiKey, setApiKey] = useState<string | null>(props.apiKey ?? null);
  const apiKeyPopupRef = useRef<HTMLDialogElement>(null);
  const [currentDatabases, setCurrentDatabases] = useState<{ id: number, name: string }[]>([]);
  const [currentTables, setCurrentTables] = useState<{ id: number, name: string }[]>([]);
  const [currentColumns, setCurrentColumns] = useState<{ id: number, name: string }[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);

  useEffect(() => {
    setName(props.name);
    setApiPath(props.apiPath);
    setDataSource(props.dataSource ?? props.schema.keys().next().value);
    setDatabase(props.database ?? -1);
    setTable(props.table ?? -1);
    setMethods(props.methods ?? []);
    setIsPrivate(props.isPrivate ?? false);
    setApiKey(props.apiKey ?? null);
    setSelectedColumns(props.columns);
  }, [props]);

  const validate = () => {
    if (name == "" || apiPath == "") return false;
    return true;
  };

  const handleCreate = async () => {
    try {
      if (validate()) {
        const response = await fetch("/api/api-server/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: apiPath,
            display: name,
            datasourceId: dataSource,
            databaseId: database,
            tableId: table,
            columns: selectedColumns,
            isPrivate: isPrivate,
            permissionFlags: (methods.includes("GET") ? 1 : 0) | (methods.includes("POST") ? 2 : 0) | (methods.includes("PATCH") ? 4 : 0) | (methods.includes("DELETE") ? 8 : 0),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.apiKey != "") {
            setApiKey(data.apiKey);
            apiKeyPopupRef.current?.showModal();
          }
          toast.success("API created successfully!");
          //router.refresh();
          if (data.apiKey == "") {
            window.location.reload();
          }
          setName('');
          setApiPath('');
        } else {
          toast.error("Failed to create API");
        }
      }
      else {
        toast.error("Fill the required information", {
          style: {
            zIndex: 10, // Ensure the toast appears above the modal
          },
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    }

    const refObj = ref as MutableRefObject<HTMLDialogElement>;

    if (isPrivate) {
      refObj.current.close(); // Close the current modal
      apiKeyPopupRef.current?.showModal(); // Open the API key modal
    } else {
      if (validate())
        refObj.current.close();
      // Additional logic for public API creation can go here
    }
  };

  const handleCancel = () => {
    setName('');
    setApiPath('');
  };

  const handleUpdate = async () => {
    const response = await fetch(`/api/api-server/${props.targetId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: apiPath,
        display: name,
        datasourceId: dataSource,
        databaseId: database,
        tableId: table,
        columns: selectedColumns,
        enabled: true, // TODO
        permissionFlags: (methods.includes("GET") ? 1 : 0) | (methods.includes("POST") ? 2 : 0) | (methods.includes("PATCH") ? 4 : 0) | (methods.includes("DELETE") ? 8 : 0),
      }),
    });

    if (response.ok) {
      toast.success("API updated successfully!");
    } else {
      toast.error("Failed to update API");
    }
    const refObj = ref as MutableRefObject<HTMLDialogElement>;
    refObj.current.close();
  }

  const handleAccess = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIsPrivate(value === "true");
  };

  const handleMethodChange = (method: string) => {
    setMethods((prevMethods) =>
      prevMethods.includes(method)
        ? prevMethods.filter((m) => m !== method)
        : [...prevMethods, method]
    );
  };

  const dataSources = [...props.schema.values()];

  /*useEffect(() => {
    if (props.schema != null) {
      setCurrentDatabases([...props.schema.get(dataSource).children.values()].map(x => { return { id: x.id, name: x.name } }));
      setDatabase(props.schema.get(dataSource).children.keys().next().value);
    }
  }, [dataSource]);*/
  useEffect(() => {
    if (props.schema != null) {
      const dataSourceObject = props.schema.get(dataSource);
      if (dataSourceObject && dataSourceObject.children) {
        const childrenArray = [...dataSourceObject.children.values()].map(x => {
          return { id: x.id, name: x.name };
        });
        setCurrentDatabases(childrenArray);
        setDatabase(dataSourceObject.children.keys().next().value);
      } else {
        console.error(`The data source object or its children are undefined for key: ${dataSource}`);
      }
    }
  }, [dataSource]);

  useEffect(() => {
    if (props.schema != null && database !== -1) {
      setCurrentTables([...props.schema.get(dataSource).children.get(database).children.values()].map(x => { return { id: x.id, name: x.name } }));
      setTable(props.schema.get(dataSource).children.get(database).children.keys().next().value);
    }

  }, [database]);

  useEffect(() => {
    if (props.schema != null && database !== -1 && table !== -1) {
      setCurrentColumns([...props.schema.get(dataSource).children.get(database).children.get(table).children.values()].map(x => { return { id: x.Id, name: x.Name } }));
      setSelectedColumns([]);
    }
  }, [table]);

  return (
    <>
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{props.editing ? "Modify API" : "Create New API"}</h3>
          <span>Please enter the API details</span>

          <div className="mt-2">
            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]">
                Name
              </label>
              <input
                className="input input-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]">
                API Path
              </label>
              <label className="input input-bordered flex items-center h-[35px] w-full flex-1 justify-center rounded-[4px] px-[10px] text-[15px] leading-none">
                /api/
                <input
                  className="text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] pr-[10px] text-[15px] leading-none"
                  value={apiPath}
                  onChange={(e) => setApiPath(e.target.value)}
                />
              </label>
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]">
                Access
              </label>
              <select
                className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                value={`${isPrivate}`}
                onChange={handleAccess}
              >
                <option value="false">Public</option>
                <option value="true">Private</option>
              </select>
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]">
                Data Source
              </label>
              <select
                className="select select-bordered text-black inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none"
                value={dataSource}
                onChange={(e) => setDataSource(parseInt(e.target.value))}
              >
                {
                  dataSources.map(ds => {
                    return <option value={`${ds.id}`} key={ds.id}>{ds.name}</option>;
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
                onChange={(e) => setDatabase(parseInt(e.target.value))}
              >
                {
                  currentDatabases.map(db => {
                    return <option value={`${db.id}`} key={db.id}>{db.name}</option>;
                  })
                }
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
              >
                {
                  currentTables.map(tb => {
                    return <option value={`${tb.id}`} key={tb.id}>{tb.name}</option>;
                  })
                }
              </select>
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <div className="collapse bg-base-200">
                <input type="checkbox" />
                <div className="collapse-title">Columns</div>
                <div className="collapse-content max-h-60 overflow-y-auto">
                  <div className="ml-4 flex flex-col gap-2 p-2">
                    {currentColumns.map((col) => (
                      <div key={col.id} className="flex flex-row">
                        <input
                          id={`col-${col.id}`}
                          type="checkbox"
                          checked={selectedColumns.includes(col.id)}
                          className="mr-2 checkbox"
                          onChange={() => {
                            if (selectedColumns.includes(col.id)) {
                              setSelectedColumns(selectedColumns.filter((id) => id !== col.id));
                            } else {
                              setSelectedColumns([...selectedColumns, col.id]);
                            }
                          }}
                        />
                        <label htmlFor={`col-${col.id}`} className="text-sm font-medium text-black">
                          {col.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="text-black w-[90px] text-right text-[15px]">
                Methods
              </label>
              <div className="join w-full flex-1 justify-center">
                <input
                  className="join-item btn"
                  type="checkbox"
                  aria-label="GET"
                  checked={methods.includes("GET")}
                  onChange={() => handleMethodChange("GET")}
                />
                <input
                  className="join-item btn"
                  type="checkbox"
                  aria-label="POST"
                  checked={methods.includes("POST")}
                  onChange={() => handleMethodChange("POST")}
                />
                <input
                  className="join-item btn"
                  type="checkbox"
                  aria-label="PATCH"
                  checked={methods.includes("PATCH")}
                  onChange={() => handleMethodChange("PATCH")}
                />
                <input
                  className="join-item btn"
                  type="checkbox"
                  aria-label="DELETE"
                  checked={methods.includes("DELETE")}
                  onChange={() => handleMethodChange("DELETE")}
                />
              </div>
            </fieldset>
          </div>

          <div className="modal-action">
            {!props.editing && <button className="btn hover:bg-black hover:text-white " onClick={handleCreate}>Create</button>}
            {props.editing && <button className="btn hover:bg-black hover:text-white " onClick={handleUpdate}>Update</button>}
            <form method="dialog">
              <button className="btn hover:bg-red-600 hover:text-white" onClick={handleCancel}>Close</button>
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

      {/* API Key Modal */}
      {isPrivate && <ApiKeyPopup ref={apiKeyPopupRef} apiKey={apiKey} />}
    </>
  )
});


ApiBuilderForm.displayName = "ApiBuilderForm";
