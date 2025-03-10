import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import InvoiceComponent from '@/src/app/components/invoiceComponent';

const Clients: React.FC = () => {
  return (
    <DashboardLayout title="">
      <InvoiceComponent />
    </DashboardLayout>
  );
}

export default Clients;
