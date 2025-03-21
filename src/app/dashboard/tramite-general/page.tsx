"use client"
import React, { useContext } from 'react';
import TramiteGenerales from '@components/tramite-general/tramiteGeneral';
import TramiteContext from '@context/tramiteContext';

const TramiteGeneral: React.FC = () => {
    const tramiteContext = useContext(TramiteContext);

    if (!tramiteContext) {
        throw new Error('ConsultaContext must be used within a TramiteStateProvider');
    }

    const { state, setState } = tramiteContext;

    return (
        <div className="p-4">
        <h1 className="text-4xl font-bold text-white pl-8 mb-4">
          Tramite general
        </h1>
        <TramiteGenerales  />
    </div>
    );
};

export default TramiteGeneral;