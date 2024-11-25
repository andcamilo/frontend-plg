import React, { useContext } from 'react';
import TramiteGenerales from '@components/tramite-general/tramiteGeneral';
import TramiteContext from '@context/tramiteContext';
import DashboardLayout from '@components/dashboardLayout';

const TramiteGeneral: React.FC = () => {
    const tramiteContext = useContext(TramiteContext);

    if (!tramiteContext) {
        throw new Error('ConsultaContext must be used within a TramiteStateProvider');
    }

    const { state, setState } = tramiteContext;

    return (
        <DashboardLayout title="Solicitud">
            <TramiteGenerales />
        </DashboardLayout>
    );
};

export default TramiteGeneral;