// src/pages/dashboard/home.tsx
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import InvoicesStadistics from '@/src/app/components/invoicesStadistics';

const Invoices: React.FC = () => {
  return (
    <DashboardLayout title="Facturas">
      <InvoicesStadistics/>
    </DashboardLayout>
  );
}

export default Invoices;