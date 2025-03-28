"use client"
import React, { useContext } from 'react';
import MenoresAlExtranjero from '@components/menores-extranjero/menoresAlExtranjero';
import MenoresContext from '@context/menoresContext';
import HomeLayout from '@components/homeLayout';

const ConsultaPropuesta: React.FC = () => {
    const menoresContext = useContext(MenoresContext);

    if (!menoresContext) {
        throw new Error('ConsultaContext must be used within a ConsultaStateProvider');
    }


    return (
        <HomeLayout>
            <div className="h-full flex items-center justify-center bg-gray-100">
                <MenoresAlExtranjero />
            </div>
        </HomeLayout>
    );
};

export default ConsultaPropuesta;