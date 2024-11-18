import React, { useContext } from 'react';
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import AppStateContext from '@/src/app/context/context';

const PaymentPage: React.FC = () => {
  const context = useContext(AppStateContext);

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
          <SaleComponent />
        </div>
      ) : (
        <p className="text-gray-400">Please complete the payment widget to proceed with the sale.</p>
      )}
    </div>
  );
};

export default PaymentPage;
