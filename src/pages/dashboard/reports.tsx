// src/pages/dashboard/reports.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import Reports from '@/src/app/components/reports/reports';

const Invoices: React.FC = () => {
  return (
    <DashboardLayout title="Reportes">
      <Reports/>
    </DashboardLayout>
  );
}

export default Invoices;