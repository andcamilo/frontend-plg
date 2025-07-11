import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableForInvoices from '../TableForInvoices';
import axios from 'axios';
import Swal from 'sweetalert2';

interface InvoiceData {
  [key: string]: any;
}

interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMorePages: boolean;
}

const ListInvoices: React.FC = () => {
  const router = useRouter();

  const [data, setData] = useState<InvoiceData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    hasMorePages: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [lawyerFilter, setLawyerFilter] = useState('');
  const [userRole, setUserRole] = useState<number>(0);

  // Fetch invoices with pagination
  const fetchInvoices = async (page: number = 1) => {
    try {
      setLoading(true);

      const response = await axios.get('/api/list-invoices', {
        params: { page, limit: 1000 } // Always fetch 1000 items as per API design
      });

      const responseData = response.data;
      console.log("🚀 ~ fetchInvoices ~ responseData:", responseData)
      
      if (responseData.status === 'success') {
        setData(responseData.data || []);
        setPagination({
          totalCount: responseData.pagination?.totalCount || 0,
          totalPages: responseData.pagination?.totalPages || 0,
          currentPage: responseData.pagination?.currentPage || 1,
          hasMorePages: responseData.pagination?.hasMorePages || false
        });
        setCurrentPage(responseData.pagination?.currentPage || 1);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
    // Get user role from localStorage or context if available
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(parseInt(storedRole));
    }
  }, []);

  const handlePageChange = (pageNumber: number) => {
    fetchInvoices(pageNumber);
  };

  // Handle editing a row
  const handleEdit = (row: InvoiceData) => {
    router.push(`/dashboard/see-invoices/${row.invoice_id}`);
  };

  // Handle approving a row
  const handleApprove = async (row: InvoiceData) => {
    console.log("🚀 ~ handleApprove ~ row:", row)
    try {
      const invoiceId = row.invoice_id || row.id || row.invoice_number;
      if (!invoiceId) {
        Swal.fire('Error', 'No se encontró el ID de la factura.', 'error');
        return;
      }
      const response = await axios.post('/api/approve-invoices', {
        invoice_ids: [invoiceId]
      });
      if (response.data && response.status === 200) {
        Swal.fire('Éxito', 'Factura aprobada correctamente.', 'success');
        fetchInvoices(currentPage);
      } else {
        Swal.fire('Error', 'No se pudo aprobar la factura.', 'error');
      }
    } catch (error: any) {
      console.error('Error approving invoice:', error);
      Swal.fire('Error', error?.response?.data?.message || 'No se pudo aprobar la factura.', 'error');
    }
  };

  // Handle selecting a row
  const handleSelect = (row: InvoiceData, checked: boolean) => {
    console.log('Seleccionar checklist for:', row, 'Checked:', checked);
    // Implement select logic here
  };

  // For bulk updates
  const handleBulkAction = async (selectedIds: string[], action: 'update' | 'delete' = 'update') => {
    if (selectedIds.length === 0) {
      alert('No se han seleccionado facturas.');
      return;
    }

    try {
      if (action === 'update') {
        const responses = await Promise.all(
          selectedIds.map((id) =>
            axios.post(`/api/set-invoice-approve?invoiceId=${encodeURIComponent(id)}`)
          )
        );

        console.log('Updated Invoices:', responses.map((r) => r.data));
        alert('Facturas actualizadas correctamente.');
      } else if (action === 'delete') {
        // Handle delete action if needed
        alert('Función de eliminación no implementada.');
        return;
      }
      
      fetchInvoices(currentPage); // Re-fetch to update the list
    } catch (error) {
      console.error('Error updating invoices:', error);
      alert('Error al actualizar las facturas.');
    }
  };

  // Handle bulk approve
  const handleApproveSelected = (selectedRows: InvoiceData[]) => {
    console.log('Aprobar seleccionados:', selectedRows);
    // Implement bulk approve logic here
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Listado de Facturas</h1>

      <TableForInvoices
        data={data}
        pagination={pagination}
        title="Facturas"
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
        onGetSelectedIds={handleBulkAction}
        loading={loading}
        lawyerFilter={lawyerFilter}
        setLawyerFilter={setLawyerFilter}
        role={userRole}
        onApprove={handleApprove}
        onSelect={handleSelect}
        onApproveSelected={handleApproveSelected}
      />
    </div>
  );
};

export default ListInvoices;
