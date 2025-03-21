"use client"
import React from 'react';
import DashboardLayout from '@components/dashboardLayout';
import CheckoutDashboard from '@components/dashboard/checkout';

const Checkout: React.FC = () => {
  return (
    <div className="p-4">
    <h1 className="text-4xl font-bold text-white pl-8 mb-4">
      Checkout
    </h1>
    <CheckoutDashboard />
  </div>
  );
}

export default Checkout;