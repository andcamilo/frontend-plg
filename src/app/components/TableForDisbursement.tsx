import React, { useState, useEffect, useMemo } from 'react';
import { getSpanishTitle } from '../utils/translateColumnTitle';

interface TableForDisbursementProps {
  data: { [key: string]: any }[];
  rowsPerPage: number;
  onChangeRowsPerPage: (value: number) => void;
  title: string;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  showActionButtons: boolean;
  onPageChange: (pageNumber: number) => void;
  onEdit: (row: { [key: string]: any }) => void;
  onGetSelectedIds: (selectedIds: string[], action?: 'update' | 'delete') => void;
  buttonText?: string;
  deleteButtonText?: string;
  loading?: boolean;
  onDelete?: (row: { [key: string]: any }) => void;
  role?: number;
}

const formatCellValue = (value: any) => {
  if (typeof value === 'boolean') return value.toString();
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

const TableForDisbursement: React.FC<TableForDisbursementProps> = ({
  data,
  rowsPerPage,
  onChangeRowsPerPage,
  title,
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  showActionButtons,
  onPageChange,
  onEdit,
  onGetSelectedIds,
  buttonText = 'Editar',
  role,
  deleteButtonText = 'Eliminar',
  loading = false,
  onDelete,
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'id') : [];
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);

  // 👇 Filtros
  const [lawyerFilter, setLawyerFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const lawyerValues = useMemo(() => {
    return Array.from(new Set(data.map(row => row['lawyer']).filter(val => val)));
  }, [data]);

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

  const canDelete = role !== undefined && [50, 90, 99].includes(role);

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-8xl mb-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-2">
          {getSpanishTitle(title)}
        </h2>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4 text-white">
          {/* Filtro por abogado */}
          {lawyerValues.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="lawyer-filter" className="text-sm">Filtrar por Abogado:</label>
              <select
                id="lawyer-filter"
                value={lawyerFilter}
                onChange={(e) => setLawyerFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded"
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
            <div className="flex items-center gap-2">
              <label htmlFor="status-filter" className="text-sm">Filtrar por Estado:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded"
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
        <p className="text-gray-300">Cargando desembolsos...</p>
      ) : filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-400 table-auto">
            <thead>
              <tr>
                {canDelete && (
                  <th className="py-2 px-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th key={index} className="py-2 px-2 text-white whitespace-nowrap">
                    {getSpanishTitle(column)}
                  </th>
                ))}
                <th className="py-2 px-2 text-white">Acciones</th>
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
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-2 px-2 whitespace-nowrap">
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                  <td className="py-2 px-2">
                    <button
                      onClick={() => onEdit(row)}
                      className="bg-profile text-white px-3 py-1 rounded-lg hover:bg-blue-500"
                    >
                      {buttonText}
                    </button>
                    {canDelete && onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 ml-2"
                      >
                        {deleteButtonText}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No hay datos disponibles.</p>
      )}

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2 text-white">
          <label htmlFor="limit" className="text-sm">Resultados por página:</label>
          <select
            id="limit"
            value={rowsPerPage}
            onChange={(e) => onChangeRowsPerPage(Number(e.target.value))}
            className="bg-gray-700 text-white px-2 py-1 rounded"
          >
            {[5, 10, 20, 50].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-gray-300">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableForDisbursement;
