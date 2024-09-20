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
  const [selectedReportType, setSelectedReportType] = useState('gastos');
  const rowsPerPage = 5;

  const [solicitudes, setSolicitudes] = useState(8);
  const [creadas, setCreadas] = useState(8);
  const [desembolsadas, setDesembolsadas] = useState(0);
  const [totalAmount, setTotalAmount] = useState(2675.21);

  const reportTypes = [
    { id: 'gastos', label: 'Reporte de Gastos' },
    { id: 'caja_chica', label: 'Reporte de Caja Chica' },
    { id: 'analisis', label: 'Reporte de análisis de gastos por categoría' },
    { id: 'clienteProveedor', label: 'Reporte de gastos por cliente o proveedor' },
    { id: 'empleado', label: 'Reporte de gastos por empleado' },
    { id: 'reembolsoPendiente', label: 'Reporte de reembolsos pendientes' },
    { id: 'conciliacion', label: 'Reporte de conciliación de caja chica' },
    { id: 'comisiones', label: 'Reporte de comisiones' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/invoices`, {
          params: {
            reportType: selectedReportType,
            limit: rowsPerPage,
            page: currentPage,
          },
        });

        const invoices = get(response, 'data.invoices', []);
        const totalInvoices = get(response, 'data.totalInvoices', 0);
        const pagination = get(response, 'data.pagination', {});

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
  }, [currentPage, selectedReportType]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleReportTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReportType(event.target.value);
    setCurrentPage(1); 
  };

  return (
    <div className="flex flex-col p-8 w-full min-h-screen">
      {/* Contenedor para seleccionar el tipo de reporte */}
      <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-bold text-white">Selecciona un tipo de reporte:</h2>
          <select
            value={selectedReportType}
            onChange={handleReportTypeChange}
            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {reportTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenedores de estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 w-full mb-4">
        <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-gray-400">Solicitudes</h3>
          <p className="text-white text-2xl">{solicitudes}</p>
        </div>
        <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-gray-400">Creadas</h3>
          <p className="text-white text-2xl">{creadas}</p>
        </div>
        <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-gray-400">Desembolsadas</h3>
          <p className="text-white text-2xl">{desembolsadas}</p>
        </div>
        <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg text-center">
          <h3 className="text-gray-400">Total ($)</h3>
          <p className="text-white text-2xl">{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Contenedor de la tabla */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
        <div className="lg:col-span-3">
          <TableWithRequests
            data={data}
            rowsPerPage={rowsPerPage}
            title={`Reportes - ${reportTypes.find(type => type.id === selectedReportType)?.label || ''}`}
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
