"use client"
import React from 'react';
import ListInvoices from '@/src/app/components/disbursement/listInvoices';

const See: React.FC = () => {
  return (
      <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
      </h1>
      <ListInvoices  />
  </div>
  );
}

export default See;