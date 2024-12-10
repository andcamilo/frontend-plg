import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';

const ListDisbursement: React.FC = () => {
  const router = useRouter(); // Initialize useRouter
  const [data, setData] = useState<{ [key: string]: any }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const rowsPerPage = 10;

  const fetchDisbursements = async (page: number) => {
    try {
      const response = await axios.get('/api/list-disbursements', {
        params: {
          page,
          limit: rowsPerPage,
        },
      });

      console.log("🚀 ~ fetchDisbursements ~ response:", response.data.disbursements);

      const { disbursements, pagination } = response.data;
      setData(disbursements);
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
      setHasPrevPage(pagination.hasPrevPage);
      setHasNextPage(pagination.hasNextPage);
    } catch (error) {
      console.error('Error fetching disbursements:', error);
    }
  };

  useEffect(() => {
    fetchDisbursements(currentPage);
  }, [currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (row: { [key: string]: any }) => {
    const id = row.id; 
    router.push(`/dashboard/see/${id}`); 
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Listado de Desembolsos</h1>
      <TableForDisbursement
        data={data}
        rowsPerPage={rowsPerPage}
        title="Desembolsos"
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
        onEdit={handleEdit} // Pass the onEdit function
      />
    </div>
  );
};

export default ListDisbursement;
