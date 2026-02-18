"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { PermissionGroup } from './PermissionGroup';
import { PermissionButton } from './PermissionButton';
import { AsyncReturnType } from '@/lib/database/types';
import { Role } from '@/lib/manage/role';
import { enableMapSet, produce } from "immer";
import Spinner from '@/components/Layout/Spinner';

interface EditRoleProps {
  roleId: number;
  roleName: string;
  viewState: AsyncReturnType<typeof Role.getAllPermissions>
}

const EditRoles = (props: EditRoleProps) => {
  const router = useRouter();
  const [allPermissions, setAllPermissions] = useState(props.viewState);
  const [currentDatabase, setCurrentDatabase] = useState({ src: -1, db: -1 });
  const [currentTable, setCurrentTable] = useState(-1);
  const [modifiedCols, setModifiedCols] = useState(new Set<number>());
  const [saving, setSaving] = useState(false);

  enableMapSet();

  const kindToFlag = (kind: "read" | "create" | "update" | "delete") => {
    switch (kind) {
      case "read":
        return 2
      case "create":
        return 1
      case "update":
        return 4
      case "delete":
        return 8
    }
  }

  const setRolePermission = useCallback((colId: number, kind: "read" | "create" | "update" | "delete", value: boolean) => {
    setAllPermissions(
      produce(allPermissions, (draft) => {
        if (value)
          draft[currentDatabase.src].children[currentDatabase.db].children[currentTable].children[colId].permission |= kindToFlag(kind)
        else
          draft[currentDatabase.src].children[currentDatabase.db].children[currentTable].children[colId].permission &= ~kindToFlag(kind)
      })
    );
    if (!modifiedCols.has(colId)) {
      let newSet = new Set(modifiedCols);
      newSet.add(colId);
      setModifiedCols(newSet);
    }
  }, [currentTable, currentDatabase, allPermissions])

  const setBulkRolePermissions = useCallback((kind: "read" | "create" | "update" | "delete", value: boolean) => {
    setAllPermissions(
      produce(allPermissions, (draft) => {
        if (value) {
          Object.values(draft[currentDatabase.src].children[currentDatabase.db].children[currentTable].children).forEach(x => x.permission |= kindToFlag(kind))
        } else {
          Object.values(draft[currentDatabase.src].children[currentDatabase.db].children[currentTable].children).forEach(x => x.permission &= ~kindToFlag(kind))
        }
      })
    );
    let toAdd = [] as number[];
    Object.values(allPermissions[currentDatabase.src].children[currentDatabase.db].children[currentTable].children).forEach(x => {
      if (!modifiedCols.has(x.columnId))
        toAdd.push(x.columnId);
    });
    if (toAdd.length > 0) {
      let newSet = new Set(modifiedCols);
      toAdd.forEach(x => newSet.add(x));
      setModifiedCols(newSet);
    }
  }, [currentTable, currentDatabase, allPermissions])

  const allColumnsPermission = useCallback((kind: "read" | "create" | "update" | "delete") => {
    return Object.values(allPermissions[currentDatabase.src].children[currentDatabase.db].children[currentTable].children).every(x => (x.permission & kindToFlag(kind)) > 0)
  }, [currentTable, currentDatabase, allPermissions])

  const submit = async () => {
    // Retrieve all the columns in form of a list
    let cols = [];
    setSaving(true);
    for (let src in allPermissions) {
      for (let db in allPermissions[src].children) {
        for (let table in allPermissions[src].children[db].children) {
          for (let col in allPermissions[src].children[db].children[table].children) {
            let colData = allPermissions[src].children[db].children[table].children[col];
            if (modifiedCols.has(colData.columnId)) {
              cols.push({
                datasourceId: colData.datasourceId,
                columnId: colData.columnId,
                databaseId: colData.databaseId,
                tableId: colData.tableId,
                permission: colData.permission
              });
            }
          }
        }
      }
    }

    await fetch(`/api/role/${props.roleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cols),
    });

    setSaving(false);

    // refresh page
    router.refresh();
  }

  return (
    <div className="p-6 min-h-[80vh]">
      <h1 className="text-2xl font-bold mb-4">Edit Role: {props.roleName}</h1>

      <div className="mb-4">
        <div className="flex flex-row w-full">
          <div className="w-[20%] min-w-[20%]">
            <h1 className="text-xl font-bold mb-4">Database</h1>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="w-[30%] min-w-[30%]">
            <h1 className="text-xl font-bold mb-4">Table</h1>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="w-[45%] min-w-[45%]">
            <h1 className="text-xl font-bold mb-4">Column Permissions</h1>
          </div>
        </div>
        <div className="flex flex-row w-full">
          <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto w-[20%] min-w-[20%] bg-base-200 rounded-box">
            <ul className="menu w-full overflow-auto menu-vertical">
              {
                Object.values(allPermissions).map((dbSrc, j) => {
                  return <>
                    <li key={j}>
                      <details>
                        <summary>{dbSrc.display}</summary>
                        <ul>
                          {Object.values(dbSrc.children).map((db, i) => {
                            return <li key={i}><a onClick={() => {
                              setCurrentDatabase({ src: dbSrc.id, db: db.id });
                              setCurrentTable(-1);
                            }
                            } >{db.display}</a></li>
                          })}
                        </ul>
                      </details>
                    </li>
                  </>
                })
              }
            </ul>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto w-[30%] min-w-[30%] bg-base-200 rounded-box">
            <ul className="menu menu-vertical">
              {(currentDatabase.src !== -1 && currentDatabase.db !== -1) &&
                Object.values(allPermissions[currentDatabase.src].children[currentDatabase.db].children).map((tbl, j) => {
                  return <>
                    <li key={j}><a onClick={() => setCurrentTable(tbl.id)}>{tbl.display}</a></li>
                  </>
                })
              }
            </ul>
          </div>
          <div className="divider divider-horizontal"></div>
          <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto w-[45%] min-w-[45%] bg-base-200 rounded-box">
            <ul className="w-full">
              {(currentDatabase.src !== -1 && currentDatabase.db !== -1 && currentTable !== -1) &&
                <><li className='flex flex-col items-stretch relative pl-[1em] pr-[1em] pt-[1em] pb-[1em]'>
                  <div className="flex justify-between items-center">
                    <span className="ml-2 font-bold">All</span>
                    <div className="flex gap-2 items-center mr-8">
                      <PermissionButton type="c" data={allColumnsPermission("create")} setData={(b) => { setBulkRolePermissions("create", b) }} />
                      <PermissionButton type="r" data={allColumnsPermission("read")} setData={(b) => { setBulkRolePermissions("read", b) }} />
                      <PermissionButton type="u" data={allColumnsPermission("update")} setData={(b) => { setBulkRolePermissions("update", b) }} />
                      <PermissionButton type="d" data={allColumnsPermission("delete")} setData={(b) => { setBulkRolePermissions("delete", b) }} />
                    </div>
                  </div>
                </li>
                  <div className="divider"></div>
                </>
              }
              {(currentDatabase.src !== -1 && currentDatabase.db !== -1 && currentTable !== -1) &&
                Object.values(allPermissions[currentDatabase.src].children[currentDatabase.db].children[currentTable].children).map((col, j) => {
                  return <>
                    <li key={j} className='flex flex-col items-stretch relative pl-[1em] pr-[1em] pt-[0.5em] pb-[0.5em]'>
                      <div className="flex justify-between items-center disabled">
                        <span className="ml-2">{col.columnDisplay}</span>
                        <div className="flex gap-2 items-center mr-8">
                          <PermissionButton type="c" data={(col.permission & 1) > 0} setData={(b) => { setRolePermission(col.columnId, "create", b) }} />
                          <PermissionButton type="r" data={(col.permission & 2) > 0} setData={(b) => { setRolePermission(col.columnId, "read", b) }} />
                          <PermissionButton type="u" data={(col.permission & 4) > 0} setData={(b) => { setRolePermission(col.columnId, "update", b) }} />
                          <PermissionButton type="d" data={(col.permission & 8) > 0} setData={(b) => { setRolePermission(col.columnId, "delete", b) }} />
                        </div>
                      </div>
                    </li>
                  </>
                })
              }
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <button
          className="bg-gray-500 text-white py-2 px-4 rounded flex items-center"
          onClick={async () => await submit()}
        >
          {saving ? <Spinner /> : <FaSave className="mr-2" />}Save
        </button>
        <button
          className="bg-gray-400 text-white py-2 px-4 rounded flex items-center"
          onClick={() => router.push('/dashboard/roles')}
        >
          <FaTimes className="mr-2" /> Cancel
        </button>
      </div>
    </div >
  );
};

export default EditRoles;
