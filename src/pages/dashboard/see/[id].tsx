import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '@components/dashboardLayout';
import DesembolsoContext from '@context/desembolsoContext';
import Disbursement from '@/src/app/components/disbursement/disbursement'; // Your main form component
import axios from 'axios';

const See: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  console.log("🚀 ~ id:", id)
  const context = useContext(DesembolsoContext);

  useEffect(() => {
    if (id && context) {
      const fetchDisbursement = async () => {
        try {
          const response = await axios.get(`/api/get-disbursement`, {
            params: { id },
          });

          const { disbursement } = response.data;
          console.log("🚀 ~ fetchDisbursement ~ disbursement:", disbursement)


          context.setState((prevState) => ({
            ...prevState,
            ...disbursement, 
          }));
        } catch (error) {
          console.error('Error fetching disbursement:', error);
        }
      };

      fetchDisbursement();
    }
  }, [id, context]);

  if (!context) {
    return <div>Loading context...</div>;
  }

  return (
    <DashboardLayout title="Editar Desembolso">
      <Disbursement />
    </DashboardLayout>
  );
};

export default See;
