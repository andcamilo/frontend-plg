import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';

const ListExpenses: React.FC = () => {
  const router = useRouter();
  const [allData, setAllData] = useState<{ [key: string]: any }[]>([]);
  const [visibleData, setVisibleData] = useState<{ [key: string]: any }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/list-expenses');
      const expenses = response.data?.data || [];

      setAllData(expenses);
      paginateData(expenses, 1, rowsPerPage); // Initialize first page
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const paginateData = (data: any[], page: number, limit: number) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    const sliced = data.slice(start, end);

    setVisibleData(sliced);
    setCurrentPage(page);
    setTotalPages(Math.ceil(data.length / limit));
    setHasPrevPage(page > 1);
    setHasNextPage(page < Math.ceil(data.length / limit));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    paginateData(allData, currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const handleEdit = (row: { [key: string]: any }) => {
    const id = row.expense_id;
    router.push(`/dashboard/see-expenses/${id}`);
  };

  const handleGetSelectedIds = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      alert('No se han seleccionado gastos.');
      return;
    }

    try {
      const response = await axios.patch('/api/update-expenses', {
        fieldUpdate: { status: 'approved' },
        ids: selectedIds,
      });

      console.log('Update Response:', response.data);
      alert('Gastos actualizados correctamente.');
      fetchExpenses();
    } catch (error) {
      console.error('Error updating expenses:', error);
      alert('Error al actualizar los gastos.');
    }
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Listado de Gastos</h1>
      {/* <TableForDisbursement
        data={visibleData}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        title="Gastos"
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onGetSelectedIds={handleGetSelectedIds}
        showActionButtons={false}
        loading={loading}
        buttonText="Ver"
      /> */}
    </div>
  );
};

export default ListExpenses;
