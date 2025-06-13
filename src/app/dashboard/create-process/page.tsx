"use client"
import React from 'react';
import CreateProcessForm from '../../components/dashboard/createProcess';

const CreateProcess: React.FC = () => {
  return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Crear Expediente
        </h1>
        <CreateProcessForm />
      </div>
  );
}

export default CreateProcess;
