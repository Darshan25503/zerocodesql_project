import AddDataSourceModel from "./AddDataSourceModel";
import React from 'react'
import Box from "./HomeComponents/Box";
import { AiFillDatabase } from "react-icons/ai";
import { GiDatabase } from "react-icons/gi";
import { BsTable } from "react-icons/bs";
import { cookies } from "next/headers";
import prisma from "../../../../prisma/client";
import { User } from "@/lib/manage/user";
import { Id } from "@/lib/manage/types";
import { Form } from "@/lib/manage/form";
import { API } from "@/lib/manage/api";
import { ClientSideDashBoard } from "./ClientSideDashBoard";

export default async function HomeDashBoard() {
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
  let dataSourcesCount = ds.size;
  let dbCount = 0;
  let tblCount = 0;
  for (const [did, d] of ds) {
    for (const [dbid, db] of d.children) {
      tblCount += db.children.size;
    }
    dbCount += d.children.size;
  }
  let superAdmin = usr.isSuperAdmin;
  let formData = await Form.getAllFormStats(superAdmin ? undefined : usr.id as Id<"User">);
  let formGraphData = await Form.getGraphApiStats(superAdmin ? undefined : usr.id as Id<"User">, '24-hours');
  let final_form_data = [];
  for (let i = 0; i < formGraphData.length; i++) {
    for (let j = 0; j < formGraphData[i].hits.length; j++) {
      final_form_data.push(new Date(formGraphData[i].hits[j].Timestamp));
    }
  }
  let apiGraphData = await API.getGraphApiStats(superAdmin ? undefined : usr.id as Id<"User">, '24-hours');
  let final_api_data = [];
  for (let i = 0; i < apiGraphData.length; i++) {
    for (let j = 0; j < apiGraphData[i].hits.length; j++) {
      final_api_data.push(new Date(apiGraphData[i].hits[j].Timestamp));
    }
  }
  let apiData = await API.getAllApiStats(superAdmin ? undefined : usr.id as Id<"User">);

  return (
    <div className="scroll-auto  bg-gray-100">
      <div className="grid lg:grid-cols-4 sm:grid-cols-2 gap-1 justify-evenly">
        {usr.isSuperAdmin && <AddDataSourceModel />}
        <Box icon={AiFillDatabase} title="Total Data Sources" amount={`${dataSourcesCount}`} />
        <Box icon={GiDatabase} title="Total Databases" amount={`${dbCount}`} />
        <Box icon={BsTable} title="Total Tables" amount={`${tblCount}`} />
      </div>
      {/*Horizontal Line */}
      <div className="px-3 ">
        <hr className="my-2 h-0.5 bg-neutral-400 w-full" />
      </div>

      <ClientSideDashBoard
        formData={formData}
        formGraphData={final_form_data}
        apiGraphData={final_api_data}
        apiData={apiData}
        dataSourcesCount={dataSourcesCount}
        superAdmin={superAdmin}
        userId={usr.id}
      />
    </div >
  )
}
