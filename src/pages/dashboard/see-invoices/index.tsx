import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import ListInvoices from '@/src/app/components/disbursement/listInvoices';

const See: React.FC = () => {
  return (
    <DashboardLayout title="Ver Facturas">
      <ListInvoices/>
    </DashboardLayout>
  );
}

export default See;