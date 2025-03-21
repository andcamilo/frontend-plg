"use client"
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import RequestDashboard from '@components/dashboard/client';

const Request: React.FC = () => {
  return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Cliente
        </h1>
        <RequestDashboard />
      </div>
  );
}

export default Request;