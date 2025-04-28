"use client"
import React, { useContext } from 'react';
import MenoresAlExtranjero from '@components/menores-extranjero/menoresAlExtranjero';
import MenoresContext from '@context/menoresContext';
import HomeLayout from '@components/homeLayout';
import WidgetLoader from "@components/widgetLoader";
import SaleComponent from "@components/saleComponent"; 


const ConsultaPropuesta: React.FC = () => {
    const menoresContext = useContext(MenoresContext);

    if (!menoresContext) {
        throw new Error('ConsultaContext must be used within a ConsultaStateProvider');
    }
    const { store } = menoresContext;

    return (
        <HomeLayout>
            <div className="h-full flex items-center justify-center bg-gray-100">
                <MenoresAlExtranjero />

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