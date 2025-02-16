import React, { useState } from 'react';

interface TableForDisbursementProps {
  data: { [key: string]: any }[];
  rowsPerPage: number;
  title: string;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  showActionButtons: boolean;
  onPageChange: (pageNumber: number) => void;
  onEdit: (row: { [key: string]: any }) => void;
  onGetSelectedIds: (selectedIds: string[]) => void; // Callback to pass selected IDs
  buttonText?: string; // Make buttonText optional
}

const toCamelCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
};

const TableForDisbursement: React.FC<TableForDisbursementProps> = ({
  data,
  rowsPerPage,
  title,
  currentPage,
  totalPages,
  showActionButtons,
  hasPrevPage,
  hasNextPage,
  onPageChange,
  onEdit,
  onGetSelectedIds,
  buttonText = "Editar", // Default to "Editar" if not provided
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = !selectAll;
    setSelectAll(allSelected);

    const newSelectedRows = data.reduce<{ [key: number]: boolean }>(
      (acc, _, index) => {
        acc[index] = allSelected;
        return acc;
      },
      {}
    );

    setSelectedRows(newSelectedRows);
  };

  const handleGetSelectedIds = () => {
    const selectedIds = Object.keys(selectedRows)
      .filter((key) => selectedRows[Number(key)])
      .map((key) => data[Number(key)].id);

    onGetSelectedIds(selectedIds);
  };

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-6xl mb-4">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr>
                <th className="py-2">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                </th>
                {columns.map((column, index) => (
                  <th key={index} className="py-2 capitalize text-white">
                    {toCamelCase(column)}
                  </th>
                ))}
                <th className="py-2 capitalize text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-700">
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={!!selectedRows[rowIndex]}
                      onChange={() => handleRowSelect(rowIndex)}
                      className="w-4 h-4"
                    />
                  </td>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-2">
                      {typeof row[column] === 'object' && row[column] !== null
                        ? JSON.stringify(row[column])
                        : row[column]}
                    </td>
                  ))}
                  <td className="py-2">
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
        ) : (
          <p className="text-gray-400">No data available</p>
        )}
      </div>

      {/* Conditionally Render Action Buttons */}
      {showActionButtons && (
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={handleGetSelectedIds}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Pre-Aprobar
          </button>
          <button
            onClick={() => console.log('Crear Gasto clicked')} // Placeholder function
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Crear Gasto
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevPage}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <div className="text-gray-400">
          Página {currentPage} de {totalPages}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default TableForDisbursement;
