// pages/consulta.tsx
import React, { useContext } from 'react';
import ConsultaPropuestas from '@components/consulta-propuesta/consultaPropuesta';
import ConsultaContext from '@context/consultaContext';
import HomeLayout from '@components/homeLayout';

const ConsultaPropuesta: React.FC = () => {
    const consultaContext = useContext(ConsultaContext);

    if (!consultaContext) {
        throw new Error('ConsultaContext must be used within a ConsultaStateProvider');
    }

    const { state, setState } = consultaContext;

    return (
        <HomeLayout>
            <div className="h-full flex items-center justify-center bg-gray-100">
                <ConsultaPropuestas />
            </div>
        </HomeLayout>
    );
};

export default ConsultaPropuesta;
