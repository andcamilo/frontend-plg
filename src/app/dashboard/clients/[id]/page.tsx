"use client"
import React from 'react';
import ClientsStatistics from '@components/dashboard/clientsStadistics';

const Clients: React.FC = () => {
  return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Clientes
        </h1>
        <ClientsStatistics />
      </div>
  );
}

export default Clients;
