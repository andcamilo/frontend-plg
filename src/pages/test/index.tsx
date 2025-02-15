import React, { useContext } from 'react';
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import AppStateContext from '@/src/app/context/context'
import SociedadContext from '@context/sociedadesContext';

const PaymentPage: React.FC = () => {
  const pensionContext = useContext(AppStateContext)
  const sociedadContext = useContext(SociedadContext);

  // Verificar si estamos trabajando con sociedad o fundación
  const context = pensionContext?.store.solicitudId ? pensionContext : sociedadContext;

  if (!context) {
    return <div>Context is not available.</div>;
  }

  const { store } = context;

  return (
    <div className="min-h-screen bg-[#13131A] text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Payment Page</h1>

      <div className="mb-6">
        <WidgetLoader />
      </div>

      {store.token ? (
        <div>
          <SaleComponent saleAmount={1} />
        </div>
      ) : (
        <p className="text-gray-400">Please complete the payment widget to proceed with the sale.</p>
      )}
    </div>
  );
};

export default PaymentPage;
