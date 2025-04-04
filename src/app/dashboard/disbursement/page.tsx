"use client"
import React from 'react';
import Disbursement from '@/src/app/components/disbursement/disbursement';

const Invoices: React.FC = () => {
  return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Desembolso
        </h1>
        <Disbursement id='' />
      </div>
  );
}

export default Invoices;