"use client"
import React from 'react';

import ListDisbursement from '@/src/app/components/disbursement/listDisbursement';

const See: React.FC = () => {
  return (
      <div className="p-4">
          <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          </h1>
          <ListDisbursement  />
      </div>
  );
}

export default See;