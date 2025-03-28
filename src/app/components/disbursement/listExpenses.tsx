import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation"; 
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';

const ListExpenses: React.FC = () => {
  const router = useRouter();
  const [data, setData] = useState<{ [key: string]: any }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const rowsPerPage = 10;

  const fetchInvoices = async (page: number) => {
    try {
      const response = await axios.get('/api/list-expenses', {
        params: {
          page,
          limit: rowsPerPage,
        },
      });
      console.log("🚀 ~ fetchInvoices ~ response:", response)

      const invoices = response.data?.data || [];

      setData(invoices);
      // Pagination handling
      setCurrentPage(page);
      setTotalPages(Math.ceil(invoices.length / rowsPerPage));
      setHasPrevPage(page > 1);
      setHasNextPage(page < Math.ceil(invoices.length / rowsPerPage));
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    fetchInvoices(currentPage);
  }, [currentPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (row: { [key: string]: any }) => {
    console.log("🚀 ~ handleEdit ~ row:", row)
    const id = row.expense_id; // Use the invoice_id as the identifier
    console.log("🚀 ~ handleEdit ~ id:", id)
    router.push(`/dashboard/see-expenses/${id}`); // Navigate to detail page
  };

  const handleGetSelectedIds = async (selectedIds: string[]) => {
    console.log('Selected IDs:', selectedIds);

    if (selectedIds.length === 0) {
      alert('No se han seleccionado facturas.');
      return;
    }

    try {
      const response = await axios.patch('/api/update-invoices', {
        fieldUpdate: { status: 'approved' }, // Example update field
        ids: selectedIds,
      });

      console.log('Update Response:', response.data);
      alert('Facturas actualizadas correctamente.');
      fetchInvoices(currentPage); // Refresh the table after update
    } catch (error) {
      console.error('Error updating invoices:', error);
      alert('Error al actualizar las facturas.');
    }
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Listado de Facturas</h1>
      <TableForDisbursement
        data={data}
        rowsPerPage={rowsPerPage}
        title="Gastos"
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        showActionButtons={false}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onGetSelectedIds={handleGetSelectedIds}
      />
    </div>
  );
};

export default ListExpenses;
