import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@components/dashboardLayout';
import Invoice from '@/src/app/components/invoice/invoice';

const SeeExpense: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get expense ID from URL

  if (!id) {
    return <div className="text-white">Cargando...</div>;
  }

  return (
    <DashboardLayout title="Ver Factura">
      <Invoice id={id as string} />
    </DashboardLayout>
  );
};

export default SeeExpense;
