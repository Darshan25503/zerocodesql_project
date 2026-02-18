"use client";
import React from 'react'
import { useState, useEffect } from 'react';

interface Props {
  onFilterChange: (filter: string) => void;
}

export default function ChartFilter({ onFilterChange }: Props) {

  const handleFilter = (value: string) => {
    onFilterChange(value);
  };

  return (
    <div>
      <select
        title='chart-filter'
        className="bg-gray-100 border text-gray-900 text-sm rounded-lg block w-full p-2.5"
        onChange={(e) => handleFilter(e.target.value)}
      >
        <option value="24-hours">Last 24 Hours</option>
        <option value="7-days">Last 7 Days</option>
        <option value="14-days">Last 14 Days</option>
        <option value="1-month">Last Month</option>
        <option value="3-months">Last 3 Months</option>
        <option value="6-months">Last 6 Months</option>
        <option value="1-year">Last Year</option>
      </select>
    </div>
  );
}
