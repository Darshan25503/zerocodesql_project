"use client"
import React, { useState, useEffect } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { IoCodeWorkingSharp } from "react-icons/io5";
import { FaFileWaveform } from "react-icons/fa6";
import { AsyncReturnType } from '@/lib/database/types';
import { API } from "@/lib/manage/api";
import { Statistics } from '@/lib/manage/shared';

interface FrontData {
  isSuperAdmin: boolean;
  statisticData: Statistics[];
  kind: string;
}

const DataSection: React.FC<FrontData> = ({ isSuperAdmin: isSuperAdmin, statisticData: statisticData, kind }) => {
  const data = statisticData;
  const [page, setPage] = useState(1);
  const pageSize = 3;
  const totalPages = Math.ceil(data.length / pageSize);
  const [loading, setLoading] = useState(false);
  const indexOfLastLead = page * pageSize;
  const indexOfFirstLead = indexOfLastLead - pageSize;
  const currentForms = data.slice(indexOfFirstLead, indexOfLastLead);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  return (
    <div className="card bg-white min-h-full">
      <div className="card-body">
        <h3 className='font-semibold mb-3 flex'><FaFileWaveform className='mr-1 mt-1' size={20} />Running</h3>
        {loading && <p className="text-center text-gray-900">Loading...</p>}
        {data.length === 0 && !loading && <p className="text-center text-gray-500">No data available</p>}
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>{kind} Name</th>
              <th>{kind} Hits</th>
              {isSuperAdmin ? <th>Username</th> : <></>}
            </tr>
          </thead>
          <tbody>
            {currentForms.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx+1}</td>
                <td>{item.name}</td>
                <td>{item.hits}</td>
                {isSuperAdmin ? <td>{item.author}</td> : <></>}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-center mt-3 flex-row">
          <div className="join">
            <button className="join-item btn" onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}>«</button>
            <button className="join-item btn">Page {page} of {totalPages}</button>
            <button className="join-item btn" onClick={() => handlePageChange(page + 1)}
              disabled={page === Math.ceil(data.length / pageSize)}>»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSection;
