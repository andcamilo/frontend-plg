'use client'

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ReportsDashboard: React.FC = () => {
    const [reportType, setReportType] = useState('reporte-gastos');
    const [categoryType, setCategoryType] = useState('de-clientes');

    const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setReportType(e.target.value);
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryType(e.target.value);
    };

    return (
        <div className="w-full p-6 bg-[#13131A] min-h-screen text-white">
            <div className="bg-[#1E1E2E] p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <select
                            value={reportType}
                            onChange={handleReportTypeChange}
                            className="w-full p-3 bg-[#1E1E2E] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 appearance-none"
                        >
                            <option value="reporte-gastos">Reporte de gastos</option>
                            <option value="reporte-caja-chica">Reporte de caja chica</option>
                            <option value="reporte-analisis-gastos">Reporte de análisis de gastos por categoría</option>
                            <option value="reporte-gastos-cliente">Reporte de gastos por cliente o proveedor</option>
                            <option value="reporte-gastos-empleado">Reporte de gastos por empleado</option>
                            <option value="reporte-reembolsos">Reporte de reembolsos pendientes</option>
                            <option value="reporte-conciliacion">Reporte de conciliación de caja chica</option>
                            <option value="reporte-comisiones">Reporte de comisiones</option>
                            <option value="zoho-facturas">Zoho - Facturas</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {reportType === 'reporte-analisis-gastos' && (
                        <div className="relative">
                            <select
                                value={categoryType}
                                onChange={handleCategoryChange}
                                className="w-full p-3 bg-[#1E1E2E] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="de-clientes">De clientes</option>
                                <option value="de-oficina">De oficina</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    )}

                    {reportType === 'reporte-gastos-cliente' && (
                        <div className="relative">
                            <select
                                value={categoryType}
                                onChange={handleCategoryChange}
                                className="w-full p-3 bg-[#1E1E2E] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="de-clientes">Cliente 1</option>
                                <option value="de-oficina">Cliente 2</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    )}

                    {reportType === 'reporte-gastos-empleado' && (
                        <div className="relative">
                            <select
                                value={categoryType}
                                onChange={handleCategoryChange}
                                className="w-full p-3 bg-[#1E1E2E] text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 appearance-none"
                            >
                                <option value="de-clientes">Abogado 1</option>
                                <option value="de-oficina">Abogado 2</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    )}
                </div>

                <div className="my-6 p-4 bg-[#1E1E2E] rounded-lg border border-gray-600">
                    <p className="text-lg">
                        <span className="text-gray-400">Saldo caja chica:</span>{" "}
                        <span className="font-semibold">$192.01</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {['Solicitudes', 'Creadas', 'Desembolsadas', 'Total ($)'].map((title) => (
                        <div key={title} className="bg-[#1E1E2E] p-6 rounded-lg border border-gray-600">
                            <h3 className="text-lg text-gray-400 mb-2">{title}</h3>
                            <p className="text-3xl font-bold">0</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReportsDashboard;
