// pages/consulta.tsx
"use client"
import React, { useContext } from 'react';
import ConsultaPropuestas from '@components/consulta-propuesta/consultaPropuesta';
import ConsultaContext from '@context/consultaContext';
import HomeLayout from '@components/homeLayout';
import WidgetLoader from "@components/widgetLoader"; 
import SaleComponent from "@components/saleComponent"; 

const ConsultaPropuesta: React.FC = () => {
    const consultaContext = useContext(ConsultaContext);

    if (!consultaContext) {
        throw new Error('ConsultaContext must be used within a ConsultaStateProvider');
    }


    const { store } = consultaContext;


    return (
        <HomeLayout>
        <div className="h-full flex flex-col items-center justify-center ">
          <ConsultaPropuestas />
  
          {store.solicitudId && (
            <>
                <WidgetLoader />
  
                  {store.token && (
                      <SaleComponent saleAmount={0} />
                  )}
            </>
          )}
        </div>
      </HomeLayout>
    );
};

export default ConsultaPropuesta;
