import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getSpanishTitle } from '../utils/translateColumnTitle';
import { LAWYERS_EMAILS } from '../utils/lawyers';

interface InvoiceData {
  [key: string]: any;
}

interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMorePages: boolean;
}

interface TableForInvoicesProps {
  data: InvoiceData[];
  pagination: PaginationInfo;
  title: string;
  onPageChange: (page: number) => void;
  onEdit: (row: InvoiceData) => void;
  onGetSelectedIds: (selectedIds: string[], action?: 'update' | 'delete') => void;
  buttonText?: string;
  deleteButtonText?: string;
  loading?: boolean;
  onDelete?: (row: InvoiceData) => void;
  role?: number;
  lawyerFilter: string;
  setLawyerFilter: (value: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onApprove: (row: InvoiceData) => void;
  onSelect: (row: InvoiceData, checked: boolean) => void;
  onApproveSelected: (selectedRows: InvoiceData[]) => void;
}

// Updated: Accept column name for special formatting
const formatCellValue = (value: any, column?: string) => {
  // Special formatting for address columns
  if (column && (column.toLowerCase().includes('direccion') || column.toLowerCase().includes('address'))) {
    if (typeof value === 'object' && value !== null) {
      // Compose a readable address string
      const { address, street2, city, state, zipcode, country } = value;
      return [
        address,
        street2,
        city,
        state,
        zipcode,
        country
      ].filter(Boolean).join(', ') || '-';
    }
  }
  if (typeof value === 'boolean') return value.toString();
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

const TableForInvoices: React.FC<TableForInvoicesProps> = ({
  data,
  pagination,
  title,
  onPageChange,
  onEdit,
  onGetSelectedIds,
  buttonText = 'Editar',
  role,
  deleteButtonText = 'Eliminar',
  loading = false,
  onDelete,
  lawyerFilter,
  setLawyerFilter,
  currentPage,
  setCurrentPage,
  onApprove,
  onSelect,
  onApproveSelected,
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'id' && col !== 'invoice_id') : [];
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);

  // 👇 Filtros
  const [statusFilter, setStatusFilter] = useState<string>('');

  const lawyerValues = LAWYERS_EMAILS;

  const statusValues = useMemo(() => {
    return Array.from(new Set(data.map(row => row['status']).filter(val => val)));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesLawyer = lawyerFilter ? row['lawyer'] === lawyerFilter : true;
      const matchesStatus = statusFilter ? row['status'] === statusFilter : true;
      return matchesLawyer && matchesStatus;
    });
  }, [data, lawyerFilter, statusFilter]);

  useEffect(() => {
    setSelectedRows({});
    setSelectAll(false);
  }, [data]);

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = !selectAll;
    setSelectAll(allSelected);

    const newSelectedRows = filteredData.reduce<{ [key: number]: boolean }>((acc, _, index) => {
      acc[index] = allSelected;
      return acc;
    }, {});
    setSelectedRows(newSelectedRows);
  };

  const handleGetSelectedIds = (action: 'update' | 'delete' = 'update') => {
    const selectedIndexes = Object.keys(selectedRows).filter((key) => selectedRows[Number(key)]);
    const selectedIds = selectedIndexes.map((key) => filteredData[Number(key)].invoice_id ?? filteredData[Number(key)].id);
    onGetSelectedIds(selectedIds, action);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      onPageChange(newPage);
    }
  };

  const canDelete = role !== undefined && [50, 90, 99].includes(role);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Track selected rows for the checklist
  const [checkedRows, setCheckedRows] = useState<{ [key: number]: boolean }>({});

  // Compute selected rows for bulk approve
  const selectedRowsForBulkApprove = filteredData.filter((_, idx) => checkedRows[idx]);

  // Loading state for approving
  const [approving, setApproving] = useState(false);

  // Wrap onApprove to show loading
  const handleApproveWithLoading = async (row: InvoiceData) => {
    setApproving(true);
    try {
      await onApprove(row);
    } finally {
      setApproving(false);
    }
  };

  // Ref for select all checkbox
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Calculate select all and indeterminate state
  const eligibleRows = filteredData.filter((row) => !['approved', 'overdue'].includes((row.status || '').toLowerCase()));
  const allSelected = eligibleRows.length > 0 && eligibleRows.every((row, idx) => checkedRows[filteredData.indexOf(row)]);
  const someSelected = eligibleRows.some((row, idx) => checkedRows[filteredData.indexOf(row)]);
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-8xl mb-4 relative">
      {/* Loading overlay */}
      {approving && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        </div>
      )}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-2">
          {getSpanishTitle(title)}
        </h2>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 text-white w-full">
          {/* Filtro por abogado */}
          {lawyerValues.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <label htmlFor="lawyer-filter" className="text-sm">Filtrar por Abogado:</label>
              <select
                id="lawyer-filter"
                value={lawyerFilter}
                onChange={(e) => setLawyerFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:w-auto"
              >
                <option value="">Todos</option>
                {lawyerValues.map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por estado */}
          {statusValues.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <label htmlFor="status-filter" className="text-sm">Filtrar por Estado:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:w-auto"
              >
                <option value="">Todos</option>
                {statusValues.map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Aprobar seleccionados button under filters, left-aligned */}
        <div className="flex justify-start mt-4 mb-2">
          <button
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 disabled:opacity-50"
            disabled={selectedRowsForBulkApprove.length === 0}
            onClick={() => onApproveSelected(selectedRowsForBulkApprove)}
          >
            Aprobar seleccionados
          </button>
        </div>

        {/* Bulk action buttons */}
        {canDelete && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleGetSelectedIds('update')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Actualizar seleccionados
            </button>
            <button
              onClick={() => handleGetSelectedIds('delete')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar seleccionados
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-gray-300">Cargando facturas...</p>
      ) : filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-400 table-auto">
            <thead>
              <tr>
                <th className="py-2 px-2">
                  {/* Select all eligible rows checkbox */}
                  <input
                    type="checkbox"
                    ref={selectAllRef}
                    checked={allSelected}
                    onChange={e => {
                      const checked = e.target.checked;
                      const newCheckedRows = { ...checkedRows };
                      filteredData.forEach((row, idx) => {
                        if (!['approved', 'overdue'].includes((row.status || '').toLowerCase())) {
                          newCheckedRows[idx] = checked;
                        }
                      });
                      setCheckedRows(newCheckedRows);
                      // Optionally, call onSelect for each row
                      filteredData.forEach((row, idx) => {
                        if (!['approved', 'overdue'].includes((row.status || '').toLowerCase())) {
                          onSelect(row, checked);
                        }
                      });
                    }}
                    className="w-4 h-4"
                  />
                </th>
                <th className="py-2 px-2 text-white min-w-[220px]">Acciones</th>
                {columns.map((column, index) => (
                  <th key={index} className="py-2 px-2 text-white whitespace-nowrap">
                    {getSpanishTitle(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-700">
                  {canDelete && (
                    <td className="py-2 px-2">
                      <input
                        type="checkbox"
                        checked={!!selectedRows[rowIndex]}
                        onChange={() => handleRowSelect(rowIndex)}
                        className="w-4 h-4"
                      />
                    </td>
                  )}
                  <td className="py-2 px-2 min-w-[220px]">
                    <div className="flex gap-2 flex-row items-center">
                      {/* Disable checkbox and Aprobar for approved/overdue */}
                      {['approved', 'overdue'].includes((row.status || '').toLowerCase()) ? (
                        <input
                          type="checkbox"
                          checked={!!checkedRows[rowIndex]}
                          disabled
                          className="w-4 h-4 opacity-50 cursor-not-allowed"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={!!checkedRows[rowIndex]}
                          onChange={e => {
                            const checked = e.target.checked;
                            setCheckedRows(prev => ({ ...prev, [rowIndex]: checked }));
                            onSelect(row, checked);
                          }}
                          className="w-4 h-4"
                        />
                      )}
                      {/* Hide Aprobar button for approved/overdue */}
                      {['approved', 'overdue'].includes((row.status || '').toLowerCase()) ? null : (
                        <button
                          onClick={() => handleApproveWithLoading(row)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50"
                          disabled={approving}
                        >
                          {approving ? 'Aprobando...' : 'Aprobar'}
                        </button>
                      )}
                    </div>
                  </td>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-2 px-2 whitespace-nowrap">
                      {formatCellValue(row[column], column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No hay datos disponibles.</p>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 w-full">
          <div className="flex items-center gap-2 text-white w-full sm:w-auto">
            <span className="text-sm">
              Mostrando {data.length} de {pagination.totalCount} resultados
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              Primera
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              Anterior
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= pagination.totalPages}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              Siguiente
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={currentPage >= pagination.totalPages}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-600"
            >
              Última
            </button>
          </div>
        </div>
      )}

      {/* Page Info */}
      {pagination.totalPages > 0 && (
        <div className="flex justify-center mt-4">
          <span className="text-gray-400 text-sm">
            Página {currentPage} de {pagination.totalPages}
          </span>
        </div>
      )}
    </div>
  );
};

export default TableForInvoices; 