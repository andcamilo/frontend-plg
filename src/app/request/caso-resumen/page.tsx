// pages/consulta.tsx
"use client"
import React, { useContext } from 'react';
import CasosResumen from '@components/casos-resumen/casos-resumen';
import HomeLayout from '@components/homeLayout';

const Corporativo: React.FC = () => {
    return (
        <HomeLayout>
            <div className="h-full flex items-center justify-center bg-gray-100">
                <CasosResumen />
            </div>
        </HomeLayout>
    );
};

export default Corporativo;