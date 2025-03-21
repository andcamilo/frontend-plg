"use client"
import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import Invoice from '@/src/app/components/invoice/invoice';

const SeeExpense: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  
  // Check if params or id is not available
  if (!params || !params.id) {
    return <div>Loading...</div>;
  }
  
  const { id } = params as { id: string };

  if (!id) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
      <Invoice id={id as string} />
  );
};

export default SeeExpense;
