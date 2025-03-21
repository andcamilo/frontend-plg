"use client"
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import Reports from '@/src/app/components/reports/reports';

const Invoices: React.FC = () => {
  return (
      <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Reportes
      </h1>
      <Reports  />
  </div>
  );
}

export default Invoices;