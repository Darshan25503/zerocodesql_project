"use client";
import DashBoardChart from "./HomeComponents/DashBoardChart";
import FunctionCountCard from "./HomeComponents/FunctionCountCard";
import { AiFillApi } from "react-icons/ai";
import { SiGoogleforms } from "react-icons/si";
import { SetStateAction, useEffect, useState } from "react";
import { FormStatistics } from "@/lib/manage/form";
import { ApiStatistics } from "@/lib/manage/api";
import DataSection from "./HomeComponents/DataSection";

interface ClientSideDashBoardProps {
  formData: FormStatistics[];
  formGraphData: Date[];
  apiGraphData: Date[];
  apiData: ApiStatistics[];
  dataSourcesCount: number;
  superAdmin: boolean;
  userId: number;
}

export const ClientSideDashBoard = ({
  formData,
  formGraphData,
  apiGraphData,
  apiData,
  dataSourcesCount,
  superAdmin,
  userId,
}: ClientSideDashBoardProps) => {
  const [selectedApiFilter, setSelectedApiFilter] = useState("24-hours");
  const [selectedFormFilter, setSelectedFormFilter] = useState("24-hours");
  const [apiGraphValues, setApiGraphValues] = useState<any[]>(apiGraphData);
  const [formGraphValues, setFormGraphValues] = useState<any[]>(formGraphData);

  const fetchDataApi = async (filter: string) => {
    setSelectedApiFilter(filter);
    await fetch('/api/api-server/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId, range: filter }),
    })
      .then(response => response.json())
      .then(data => {
        let tmp_data: SetStateAction<any[]> = [];
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data[i].hits.length; j++) {
            tmp_data.push(data[i].hits[j].Timestamp);
          }
        }
        setApiGraphValues(tmp_data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const fetchDataForm = async (filter: string) => {
    setSelectedFormFilter(filter);
    await fetch('/api/form/dashboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: userId, range: filter }),
    })
      .then(response => response.json())
      .then(data => {
        let tmp_data: SetStateAction<any[]> = [];
        for (let i = 0; i < data.length; i++) {
          for (let j = 0; j < data[i].hits.length; j++) {
            tmp_data.push(data[i].hits[j].Timestamp);
          }
        }
        setFormGraphValues(tmp_data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="p-4 gap-4 flex flex-col">
      {/* Forms Analytics Section */}
      <div className="grid lg:grid-cols-3 sm:grid-cols-3 gap-4 justify-evenly">
        <div className="card bg-white border-slate-200 border-2 col-span-2">
          <div className="card-body">
            <div className="flex col-span-2 ml-3 text-2xl my-3 text-gray-800 font-bold items-center">
              <SiGoogleforms className="mt-1 mx-3" />FORMS ANALYTICS
              <div className="ml-auto">
                <select
                  className="bg-gray-100 border text-gray-900 text-sm rounded-lg block w-full p-2.5"
                  onChange={(e) => fetchDataForm(e.target.value)}
                  value={selectedFormFilter}
                >
                  <option value="24-hours">Last 24 Hours</option>
                  <option value="7-days">Last 7 Days</option>
                  <option value="1-month">Last Month</option>
                  <option value="3-months">Last 3 Months</option>
                  <option value="6-months">Last 6 Months</option>
                  <option value="1-year">Last Year</option>
                </select>
              </div>
            </div>
            <div className="grid">
              <DashBoardChart apiGraphData={formGraphValues} selectedFilter={selectedFormFilter} isApiData={false} />
            </div>
          </div>
        </div>
        <div>
          <FunctionCountCard icon={SiGoogleforms} title="Forms Created" amount={`${formData.length}`} />
          <div className="card bg-white border-slate-200 border-2">
            <div className="card-body">
              <div className="grid overflow-hidden -ml-2">
                <DataSection isSuperAdmin={superAdmin} statisticData={formData} kind="Form" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Usage Section */}
      <div className="grid lg:grid-cols-3 sm:grid-cols-3 gap-4 justify-evenly">
        <div className="card bg-white border-slate-200 border-2 col-span-2">
          <div className="card-body">
            <div className="flex col-span-2 ml-3 text-2xl my-3 text-gray-800 font-bold items-center">
              <AiFillApi className="mt-1 mx-3" />API USAGE
              <div className="ml-auto">
                <div>
                  {/* <ChartFilter onFilterChange={setSelectedFilter} /> */}
                  <select
                    className="bg-gray-100 border text-gray-900 text-sm rounded-lg block w-full p-2.5"
                    onChange={(e) => fetchDataApi(e.target.value)}
                    value={selectedApiFilter}
                  >
                    <option value="24-hours">Last 24 Hours</option>
                    <option value="7-days">Last 7 Days</option>
                    <option value="1-month">Last Month</option>
                    <option value="3-months">Last 3 Months</option>
                    <option value="6-months">Last 6 Months</option>
                    <option value="1-year">Last Year</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid">
              <DashBoardChart apiGraphData={apiGraphValues} selectedFilter={selectedApiFilter} isApiData={true} />
            </div>
          </div>
        </div>
        <div>
          <FunctionCountCard icon={AiFillApi} title="APIs Created" amount={`${apiData.length}`} />
          <div className="card bg-white border-slate-200 border-2">
            <div className="card-body">
              <div className="grid">
                <DataSection isSuperAdmin={superAdmin} statisticData={apiData} kind="API" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
