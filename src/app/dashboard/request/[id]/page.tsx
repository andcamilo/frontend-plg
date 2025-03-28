"use client"
import React from 'react';
import RequestDashboard from '@components/dashboard/solicitud';

const Request: React.FC = () => {
  return (
      <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Solicitud
      </h1>
      <RequestDashboard  />
  </div>
  );
}

export default Request;