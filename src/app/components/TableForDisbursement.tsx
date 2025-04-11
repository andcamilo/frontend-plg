import React, { useState, useEffect } from 'react';
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
  onGetSelectedIds: (selectedIds: string[]) => void;
  buttonText?: string;
  loading?: boolean;
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
  loading = false,
}) => {
  // Exclude 'id' from columns to render, but keep it in row data
  const columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'id') : [];
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);

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

    const newSelectedRows = data.reduce<{ [key: number]: boolean }>((acc, _, index) => {
      acc[index] = allSelected;
      return acc;
    }, {});
    setSelectedRows(newSelectedRows);
  };

  const handleGetSelectedIds = () => {
    const selectedIndexes = Object.keys(selectedRows).filter((key) => selectedRows[Number(key)]);
    const selectedIds = selectedIndexes.map((key) => data[Number(key)].invoice_id ?? data[Number(key)].id);
    onGetSelectedIds(selectedIds);
  };

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-8xl mb-4">
      <h2 className="text-lg font-bold text-white mb-4">
        {getSpanishTitle(title)}
      </h2>

      {loading ? (
        <p className="text-gray-300">Cargando desembolsos...</p>
      ) : data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-400 table-auto">
            <thead>
              <tr>
                <th className="py-2 px-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                {columns.map((column, index) => (
                  <th key={index} className="py-2 px-2 text-white whitespace-nowrap">
                    {getSpanishTitle(column)}
                  </th>
                ))}
                <th className="py-2 px-2 text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-700">
                  <td className="py-2 px-2">
                    <input
                      type="checkbox"
                      checked={!!selectedRows[rowIndex]}
                      onChange={() => handleRowSelect(rowIndex)}
                      className="w-4 h-4"
                    />
                  </td>
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
