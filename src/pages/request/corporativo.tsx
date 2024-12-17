// pages/consulta.tsx
import React, { useContext } from 'react';
import Corporativos from '@components/corporativo/corporativo';
import CorporativoContext from '@context/corporativoContext';
import HomeLayout from '@components/homeLayout';

const Corporativo: React.FC = () => {
    const corporativoContext = useContext(CorporativoContext);

    if (!corporativoContext) {
        throw new Error('ConsultaContext must be used within a ConsultaStateProvider');
    }


    return (
        <HomeLayout>
            <div className="h-full flex items-center justify-center bg-gray-100">
                <Corporativos />
            </div>
        </HomeLayout>
    );
};

export default Corporativo;