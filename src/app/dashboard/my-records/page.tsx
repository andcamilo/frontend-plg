"use client"
import React from 'react';
import MyRecordsTable from '../../components/dashboard/MyRecordsTable';

const MyReports: React.FC = () => {
  return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Mis Expedientes
        </h1>
        <MyRecordsTable />
      </div>
  );
}

export default MyReports;
