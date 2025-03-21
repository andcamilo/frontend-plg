"use client"
import React from 'react';
import RequestsCasos from '@components/requestsCasos';

const Requests: React.FC = () => {
  return (
      <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Casos Pension
      </h1>
      <RequestsCasos  />
  </div>
  );
}

export default Requests;