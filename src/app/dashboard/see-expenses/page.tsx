"use client"
import React from 'react';
import ListExpenses from '@/src/app/components/disbursement/listExpenses';

const See: React.FC = () => {
  return (  
      <div className="p-4">
          <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          </h1>
          <ListExpenses  />
      </div>
  );
}

export default See;