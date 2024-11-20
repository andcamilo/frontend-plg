import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import CheckoutDashboard from '@components/dashboard/checkout';

const Checkout: React.FC = () => {
  return (
    <DashboardLayout title="Checkout">
      <CheckoutDashboard />
    </DashboardLayout>
  );
}

export default Checkout;