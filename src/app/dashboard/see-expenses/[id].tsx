"use client"
import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import Expense from '@/src/app/components/expense/expense';

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
      <Expense id={id as string} />
  );
};

export default SeeExpense;
