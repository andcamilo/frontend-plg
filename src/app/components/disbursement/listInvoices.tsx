import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';

const ListInvoices: React.FC = () => {
  const router = useRouter();

  // We'll store the entire array in 'allData',
  // and the "current page" data in 'data'
  const [allData, setAllData] = useState<{ [key: string]: any }[]>([]);
  const [data, setData] = useState<{ [key: string]: any }[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [loading, setLoading] = useState(false);

  // Used to slice data for local pagination
  const paginateData = (fullData: any[], page: number, limit: number) => {
    const start = (page - 1) * limit;
    const paginated = fullData.slice(start, start + limit);

    setData(paginated);
    setCurrentPage(page);

    const total = fullData.length;
    const pages = Math.ceil(total / limit);

    setTotalPages(pages);
    setHasPrevPage(page > 1);
    setHasNextPage(page < pages);
  };

  // Fetch a large dataset (1000 items) in one shot
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      // The Next.js API route is /api/list-invoices
      // This route itself will fetch from your backend with 1000-limit
      const response = await axios.get('/api/list-invoices');
      // response.data.data is the array of invoices
      const invoices = response.data?.data || [];

      setAllData(invoices);
      paginateData(invoices, 1, rowsPerPage);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // If either currentPage or rowsPerPage changes,
  // we re-slice the data from allData
  useEffect(() => {
    paginateData(allData, currentPage, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleChangeRowsPerPage = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  // Handle editing a row
  const handleEdit = (row: { [key: string]: any }) => {
    router.push(`/dashboard/see-invoices/${row.invoice_id}`);
  };

  // For bulk updates
  const handleGetSelectedIds = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      alert('No se han seleccionado facturas.');
      return;
    }

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          axios.post(`/api/set-invoice-approve?invoiceId=${encodeURIComponent(id)}`)
        )
      );

      console.log('Updated Invoices:', responses.map((r) => r.data));
      alert('Facturas actualizadas correctamente.');
      fetchInvoices(); // Re-fetch to update the list
    } catch (error) {
      console.error('Error updating invoices:', error);
      alert('Error al actualizar las facturas.');
    }
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Listado de Facturas</h1>

      {/* Table component for displaying invoice data with pagination, row selection,
          and action buttons for viewing/editing individual invoices 
      <TableForDisbursement
        data={data}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        title="Facturas"
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onGetSelectedIds={handleGetSelectedIds}
        showActionButtons={true}
        loading={loading}
        buttonText="Ver"
      />*/}
    </div>
  );
};

export default ListInvoices;
