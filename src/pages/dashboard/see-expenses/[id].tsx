import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@components/dashboardLayout';
import Expense from '@/src/app/components/expense/expense';

const SeeExpense: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get expense ID from URL

  if (!id) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <DashboardLayout title="Ver Gasto">
      <Expense id={id as string} />
    </DashboardLayout>
  );
};

export default SeeExpense;
