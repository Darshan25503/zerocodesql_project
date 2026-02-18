import { Toaster } from "react-hot-toast"
import { useRef, useState } from "react"
import { User } from "@/lib/manage/user"
import { cookies } from "next/headers"
import prisma from "../../../prisma/client"
import { Id } from "@/lib/manage/types"
import { ApiBuilderFormPopupContainer } from "./ApiBuilderFormPopupContainer"
import { API } from "@/lib/manage/api"
import { ApiBuilderList } from "./ApiBuilderList"


export const ApiBuilderComponent = async () => {

  let sess = cookies().get('session-us')?.value;
  if (sess == null)
    return <></>
  let usr = await prisma.user.findFirst({
    where: {
      Session: {
        some: {
          sessionToken: sess
        }
      }
    }
  });
  let ds = await User.getAccessibleEntities(usr.id as Id<'User'>);
  let apis = await API.listAPIs();
  let filteredApis = [];
  for (const api of apis) {
    if (!ds.has(api.Datasource_id))
      continue;
    if (!ds.get(api.Datasource_id).children.has(api.Database_id))
      continue;
    if (!ds.get(api.Datasource_id).children.get(api.Database_id).children.has(api.Table_id))
      continue;
    filteredApis.push(api);
  }

  return (
    <div>
      <Toaster />
      <ApiBuilderFormPopupContainer schema={ds} />

      <div className=" text-black bg-slate-100 rounded-md m-5 p-5">
        <h1 className="text-xl font-bold">API Management</h1>
        <p className="text-justify my-5 text-sm">In this section, users can efficiently manage their APIs.
          You have the ability to create, edit, and delete APIs as needed.
          Additionally, you can enable or disable APIs to control their availability and usage.
          This functionality allows you to maintain full control over your API ecosystem, ensuring that
          it meets your applications needs.</p>
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">API Settings</h2>
        </div>
        <ApiBuilderList apis={filteredApis} schema={ds} />
      </div>
    </div>
  )
}