import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';

const ListDisbursement: React.FC = () => {
  const router = useRouter(); // Next.js router for navigation
  const [data, setData] = useState<{ [key: string]: any }[]>([]); // Table data
  const [currentPage, setCurrentPage] = useState(1); // Current pagination page
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const rowsPerPage = 10;

  /**
   * Fetch the disbursement list from the API.
   */
  const fetchDisbursements = async (page: number) => {
    try {
      const response = await axios.get('/api/list-disbursements', {
        params: { page, limit: rowsPerPage },
      });

      console.log('🚀 ~ fetchDisbursements ~ response:', response.data);

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

  /**
   * Triggered when the component mounts or the current page changes.
   */
  useEffect(() => {
    fetchDisbursements(currentPage);
  }, [currentPage]);

  /**
   * Update the current page for pagination.
   */
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  /**
   * Handle row editing and redirect to the detailed page.
   */
  const handleEdit = (row: { [key: string]: any }) => {
    const id = row.id; // Extract the ID from the row
    router.push(`/dashboard/see/${id}`); // Navigate to detail page
  };

  const handleGetSelectedIds = async (selectedIds: string[]) => {
    console.log('Selected IDs:', selectedIds);

    if (selectedIds.length === 0) {
      alert('No se han seleccionado desembolsos.');
      return;
    }

    try {
      const response = await axios.patch('/api/update-disbursements', {
        fieldUpdate: { status: 'pre-aprobada' }, // Example update field
        ids: selectedIds,
      });

      console.log('🚀 ~ handleGetSelectedIds ~ Update Response:', response.data);
      alert('Desembolsos actualizados correctamente.');
      fetchDisbursements(currentPage); // Refresh the table after update
    } catch (error) {
      console.error('Error updating disbursements:', error);
      alert('Error al actualizar los desembolsos.');
    }
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
        onEdit={handleEdit} // Pass the edit callback
        onGetSelectedIds={handleGetSelectedIds} // Pass the callback to handle selected IDs
      />
    </div>
  );
};

export default ListDisbursement;
