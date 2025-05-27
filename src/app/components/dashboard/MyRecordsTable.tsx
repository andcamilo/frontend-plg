import React, { useState } from 'react';
import TableWithPagination from '../TableWithPagination';
import { useRouter } from 'next/navigation';

const fakeData = [
  {
    Tipo: 'Sociedad / Empresa',
    Fecha: '16/01/2025',
    Email: 'chris@re7.capital',
    Estatus: 'Finalizada',
    Expediente: '2025-0002',
    Abogado: 'Oscar Ortega Mata, Maria Teresa Clemente',
    Opciones: ''
  },
  {
    Tipo: 'Sociedad / Empresa',
    Fecha: '26/11/2024',
    Email: 'pknibb@hotmail.com',
    Estatus: 'Finalizada',
    Expediente: '2024-0036',
    Abogado: 'Manuel Tejada, Maria Teresa Clemente',
    Opciones: ''
  }
];

const rowsPerPage = 10;

const MyRecordsTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  const totalPages = Math.ceil(fakeData.length / rowsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const paginatedData = fakeData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map(row => ({
    ...row,
    Opciones: (
      <button
        className="bg-profile text-white px-4 py-1 rounded hover:bg-pink-700 transition-colors"
        onClick={() => router.push(`/dashboard/record/${row.Expediente}`)}
      >
        Status
      </button>
    )
  }));

  return (
    <TableWithPagination
      data={paginatedData}
      rowsPerPage={rowsPerPage}
      title="Mis expedientes"
      currentPage={currentPage}
      totalPages={totalPages}
      hasPrevPage={hasPrevPage}
      hasNextPage={hasNextPage}
      onPageChange={setCurrentPage}
    />
  );
};

export default MyRecordsTable; 