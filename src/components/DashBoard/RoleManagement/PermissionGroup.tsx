"use client";

import { useState } from "react";
import { PermissionButton } from "./PermissionButton";

interface PermissionGroupProps {
  title: string,
  group: string,
  groupPermissions: {
    read: boolean,
    create: boolean,
    update: boolean,
    delete: boolean
  },
  setGroupPermissions: (kind: "read" | "create" | "update" | "delete", value: boolean) => void
  children: React.ReactNode,
  childrenTitle: string
}

export const PermissionGroup = (props: PermissionGroupProps) => {
  return (
    <details className="collapse collapse-arrow collapse-arrow-fix bg-base-200 mx-2">
      <summary className="collapse-title p-1 min-h-0">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold ml-2">{props.title}</span>
          <div className="flex gap-2 items-center mr-8">
            <PermissionButton type="c" data={props.groupPermissions.create} setData={(b) => props.setGroupPermissions("create", b)} />
            <PermissionButton type="r" data={props.groupPermissions.read} setData={(b) => props.setGroupPermissions("read", b)} />
            <PermissionButton type="u" data={props.groupPermissions.update} setData={(b) => props.setGroupPermissions("update", b)} />
            <PermissionButton type="d" data={props.groupPermissions.delete} setData={(b) => props.setGroupPermissions("delete", b)} />
          </div>
        </div>
      </summary>
      <div className="collapse-content max-h-[150em] overflow-y-auto">
        {props.children != null && <h2 className="text-sm font-bold">{props.childrenTitle}</h2>}
        {props.children}
      </div>
    </details>
  )
}