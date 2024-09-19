import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableWithPagination from './TableWithPagination';

const ClientsStatistics: React.FC = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rowsPerPage = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/client', {
          params: {
            limit: rowsPerPage,
            page: currentPage,
          },
        });

        const { personas, totalRecords, pagination } = response.data;
        
        const formattedData = personas.map((persona: any) => ({
          cliente: persona.nombre,
          email: persona.email,
          date: new Date(persona.date._seconds * 1000).toLocaleDateString(),
          status: persona.status === 1 ? 'Activo' : 'Inactivo',
          actions: '...',
        }));

        setData(formattedData);
        setTotalRecords(totalRecords);
        setTotalPages(Math.ceil(totalRecords / rowsPerPage));
        setHasPrevPage(pagination.hasPrevPage);
        setHasNextPage(pagination.hasNextPage);
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex flex-col p-8 w-full min-h-screen">
      <div className="flex items-center w-full">
        <div className="flex items-center w-full max-w-4xl">
          <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
            <select className="py-3 px-5 pe-9 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm">
              <option>Clientes</option>
            </select>
          </div>
          <div className="bg-component text-[#b8b8b8] px-10 py-4 rounded-lg w-full ml-4 flex flex-col justify-center items-center">
            <h2 className="text-sm">Clientes</h2>
            <h3 className="text-2xl font-bold text-white">{totalRecords}</h3>
          </div>
        </div>
      </div>
      <div className="flex items-center w-full mt-5">
        <div className="w-full max-w-4xl">
          <TableWithPagination
            data={data}
            rowsPerPage={rowsPerPage}
            title="Clientes"
            currentPage={currentPage}
            totalPages={totalPages}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientsStatistics;
