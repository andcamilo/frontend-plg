'use client';

import React, { useContext, useEffect } from 'react';
import WidgetLoader from './widgetLoader';
import SaleComponent from './saleComponent';
import AppStateContext from '@context/context';
import AppStateContextFundacion from '@context/fundacionContext';
import MenoresContext from '@context/menoresContext';
import SociedadContext from '@context/sociedadesContext';
import ConsultaContext from "@context/consultaContext";
import PaymentContext from '@context/paymentContext';
import { X } from 'lucide-react';

function usePaymentContext() {
  const pension    = useContext(AppStateContext);
  const fundacion  = useContext(AppStateContextFundacion);
  const sociedad   = useContext(SociedadContext);
  const menores    = useContext(MenoresContext);
  const consulta   = useContext(ConsultaContext);
  const payment    = useContext(PaymentContext);

  // Use the same logic as widgetLoader.tsx and saleComponent.tsx - select context with solicitudId
  const selectedContext = pension?.store.solicitudId
    ? pension
    : fundacion?.store.solicitudId
    ? fundacion
    : sociedad?.store.solicitudId
    ? sociedad
    : menores?.store.solicitudId
    ? menores
    : consulta?.store.solicitudId
    ? consulta
    : payment;

  console.log("🚀 ~ PaymentModal ~ Context selection:");
  console.log("🚀 ~ pension solicitudId:", pension?.store.solicitudId);
  console.log("🚀 ~ fundacion solicitudId:", fundacion?.store.solicitudId);
  console.log("🚀 ~ sociedad solicitudId:", sociedad?.store.solicitudId);
  console.log("🚀 ~ menores solicitudId:", menores?.store.solicitudId);
  console.log("🚀 ~ consulta solicitudId:", consulta?.store.solicitudId);
  console.log("🚀 ~ Selected context for PaymentModal:", selectedContext?.constructor.name || 'payment');
  console.log("🚀 ~ Selected context store.token:", selectedContext?.store.token);

  return selectedContext;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleAmount: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, saleAmount }) => {
  const context = usePaymentContext();

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);
  
  if (!isOpen || !context) {
    return null;
  }

  const { store } = context;

  console.log("🚀 ~ PaymentModal Render ~ store.token:", store.token);
  console.log("🚀 ~ PaymentModal Render ~ !store.token:", !store.token);
  console.log("🚀 ~ PaymentModal Render ~ Will show:", !store.token ? "WidgetLoader" : "SaleComponent");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-lg relative border border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>
        <div className="text-center mb-6">
            <h2 className="text-white text-3xl font-bold">Procesar Pago</h2>
            <p className="text-gray-400">Complete los detalles de su tarjeta de crédito.</p>
        </div>
        
        {!store.token ? (
          <WidgetLoader />
        ) : (
          <div>
            <p className="text-green-400 text-center mb-4 font-semibold">¡Token de pago generado exitosamente!</p>
            <SaleComponent saleAmount={saleAmount} />
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentModal; 