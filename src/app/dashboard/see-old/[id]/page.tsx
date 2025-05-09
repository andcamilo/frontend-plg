"use client"
import React, { useEffect, useState, useContext } from 'react';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import OldDesembolsoContext, { OldDesembolsoProvider } from '@context/oldDesembolsoContext';
import OldDisbursement from '@/src/app/components/disbursement/oldDisbursement';// We'll need to create this component
import axios from 'axios';

const SeeOld: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  
  const id = params?.id as string | undefined;
  const context = useContext(OldDesembolsoContext);
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

          if (isMounted) {
            context.setState(disbursement);
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
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Editar Desembolso Antiguo
        </h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (typeof id !== 'string') {
    return (
      <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Editar Desembolso Antiguo
        </h1>
        <div>Error: Invalid Disbursement ID</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold text-white pl-8 mb-4">
        Editar Desembolso Antiguo
      </h1>
      <OldDisbursement id={id} />
    </div>
  );
};

export default SeeOld; 