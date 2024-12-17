import React, { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@components/dashboardLayout';
import DesembolsoContext from '@context/desembolsoContext';
import Disbursement from '@/src/app/components/disbursement/disbursement'; // Your main form component
import axios from 'axios';

const See: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const context = useContext(DesembolsoContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDisbursement = async () => {
      if (id && context) {
        try {
          const response = await axios.get(`/api/get-disbursement`, {
            params: { id },
          });

          const { disbursement } = response.data;
          console.log("🚀 ~ fetchDisbursement ~ disbursement:", disbursement);

          context.setState((prevState) => ({
            ...prevState,
            ...disbursement,
          }));

          console.log("🚀 ~ context:", context?.state)

          setLoading(false);
        } catch (error) {
          console.error('Error fetching disbursement:', error);
          setLoading(false);
        }
      }
    };

    fetchDisbursement();
  }, [id]);


  if (loading) {
    return (
      <DashboardLayout title="Editar Desembolso">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Editar Desembolso">
      <Disbursement />
    </DashboardLayout>
  );
};

export default See;
