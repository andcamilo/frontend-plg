import React, { useEffect, useState } from 'react';
import axios from 'axios';
import get from 'lodash/get';
import TableWithRequests from '@components/TableWithRequests';

const InvoicesStatistics: React.FC = () => {
  const [data, setData] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/invoices', {
          params: {
            limit: rowsPerPage,
            page: currentPage,
          },
        });

        const invoices = get(response, 'data.invoices', []);
        const totalInvoices = get(response, 'data.totalInvoices', 0);
        const pagination = get(response, 'data.pagination', {});

        // Formatear los datos que quieres mostrar en la tabla
        const formattedData = invoices.map((invoice: any) => ({
          date: get(invoice, 'date', 'N/A'),
          invoice_number: get(invoice, 'invoice_number', 'N/A'),
          customer_name: get(invoice, 'customer_name', 'N/A'),
          total: `$${get(invoice, 'total', 0).toFixed(2)}`,
          status: get(invoice, 'status', 'N/A'),
          actions: '...',
        }));

        setData(formattedData);
        setTotalInvoices(totalInvoices);
        setTotalPages(Math.ceil(totalInvoices / rowsPerPage));
        setHasPrevPage(get(pagination, 'hasPrevPage', false));
        setHasNextPage(get(pagination, 'hasNextPage', false));
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex flex-col p-8 w-full min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
        <div className="lg:col-span-3">
          <TableWithRequests
            data={data}
            rowsPerPage={rowsPerPage}
            title="Facturas"
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

export default InvoicesStatistics;
