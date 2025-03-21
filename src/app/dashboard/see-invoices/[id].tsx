"use client"
import React from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import DashboardLayout from '@components/dashboardLayout';
import Invoice from '@/src/app/components/invoice/invoice';

const SeeExpense: React.FC = () => {
  const router = useRouter();
  const params = useParams() as { id: string };
    const { id } = params; // Get expense ID from URL

  if (!id) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
      <Invoice id={id as string} />
  );
};

export default SeeExpense;
