import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';

const ListDisbursement: React.FC = () => {
  const router = useRouter();

  const [data, setData] = useState<{ [key: string]: any }[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchDisbursements = async (page: number, limit: number) => {
    try {
      setLoading(true);

      const response = await axios.get('/api/list-disbursements', {
        params: {
          limit,
          page,
        },
      });

      const { disbursements, totalPages: backendTotalPages } = response.data;

      const cleanedDisbursements = disbursements.map(({ id, ...rest }) => rest);
      console.log("🚀 ~ fetchDisbursements ~ disbursements:", cleanedDisbursements)

      setData(disbursements || []);
      setTotalPages(backendTotalPages || 1);
    } catch (error) {
      console.error('Error fetching disbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisbursements(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  const handleEdit = (row: { [key: string]: any }) => {
    const id = row.id;
    router.push(`/dashboard/see/${id}`);
  };

  const handleGetSelectedIds = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      alert('No se han seleccionado desembolsos.');
      return;
    }

    try {
      const response = await axios.patch('/api/update-disbursements', {
        fieldUpdate: { status: 'pre-aprobada' },
        ids: selectedIds,
      });

      console.log('🚀 ~ handleGetSelectedIds ~ Update Response:', response.data);
      alert('Desembolsos actualizados correctamente.');
      fetchDisbursements(currentPage, rowsPerPage);
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
        onChangeRowsPerPage={handleRowsPerPageChange}
        title="Desembolsos"
        showActionButtons={false}
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={currentPage > 1}
        hasNextPage={currentPage < totalPages}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onGetSelectedIds={handleGetSelectedIds}
        loading={loading}
      />
    </div>
  );
};

export default ListDisbursement;
