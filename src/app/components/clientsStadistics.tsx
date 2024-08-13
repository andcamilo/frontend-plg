import React from 'react';
import TableWithPagination from './TableWithPagination';

const data = [
    { cliente: 'Jose perez', email: 'vijole7360@cubene.com', date: '07-02-2024', status: 'Activo', actions: '...' },
    { cliente: 'Alexander Silva', email: 'wilmer@mgpanel.org', date: '24-11-2023', status: 'Activo', actions: '...' },
    { cliente: 'maria', email: 'sivin48250@artgulin.com', date: '04-03-2024', status: 'Activo', actions: '...' },
    { cliente: 'andres', email: 'lanofa7377@fresec.com', date: '29-05-2024', status: 'Activo', actions: '...' },
    { cliente: 'andrea p', email: 'yenok17520@oprevolt.com', date: '15-02-2024', status: 'Activo', actions: '...' }
  ];

const ClientsStatistics: React.FC = () => {
  return (
    <div className="flex flex-col p-8 w-full min-h-screen">
        <div className="flex items-center w-full">
            <div className="flex items-center w-full max-w-4xl">
                <div className="bg-[#1F1F2E] text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
                    <select className="py-3 px-5 pe-9 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm">
                        <option>Clientes</option>
                        <option>Zoho - Clientes</option>
                    </select>
                </div>
                <div className="bg-[#1F1F2E] text-[#b8b8b8] px-10 py-4 rounded-lg w-full ml-4 flex flex-col justify-center items-center">
                    <h2 className="text-sm">Clientes</h2>
                    <h3 className="text-2xl font-bold text-white">22</h3>
                </div>

            </div>
        </div>
        <div className="flex items-center w-full mt-5">
            <div className="w-full max-w-4xl">
                <TableWithPagination data={data} rowsPerPage={3} title="Clientes" />
            </div>
        </div>
    </div>
  );
};

export default ClientsStatistics;
