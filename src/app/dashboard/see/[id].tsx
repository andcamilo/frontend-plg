"use client"
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import DashboardLayout from '@components/dashboardLayout';
import DesembolsoContext from '@context/desembolsoContext';
import Disbursement from '@/src/app/components/disbursement/disbursement'; // Your main form component
import axios from 'axios';

const See: React.FC = () => {
  const router = useRouter();
  const params = useParams() as { id: string };
    const { id } = params;
  const context = useContext(DesembolsoContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; 

    const fetchDisbursement = async () => {
      if (typeof id === 'string' && context) {
        try {
          const response = await axios.get(`/api/get-disbursement`, {
            params: { id },
          });

          const { disbursement } = response.data;
          console.log("🚀 ~ fetchDisbursement ~ disbursement:", disbursement);

          if (isMounted) {
            context.setState((prevState) => ({
              ...prevState,
              ...disbursement,
            }));

            console.log("🚀 ~ context:", context?.state);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching disbursement:', error);
          if (isMounted) setLoading(false);
        }
      }
    };

    fetchDisbursement();

    return () => {
      isMounted = false; // Cleanup function to avoid state updates
    };
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Editar Desembolso">
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  if (typeof id !== 'string') {
    return (
      <DashboardLayout title="Editar Desembolso">
        <div>Error: Invalid Disbursement ID</div>
      </DashboardLayout>
    );
  }

  return (
      <Disbursement id={id} />
  );
};

export default See;
