import React, { useState } from 'react';

interface TableForDisbursement {
  data: { [key: string]: any }[];
  rowsPerPage: number;
  title: string;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (pageNumber: number) => void;
  onEdit: (row: { [key: string]: any }) => void; // Callback for edit button
}

const TableForDisbursement: React.FC<TableForDisbursement> = ({
  data,
  rowsPerPage,
  title,
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
  onEdit,
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({}); // Track selected rows
  const [selectAll, setSelectAll] = useState(false); // Track "Select All" state

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = !selectAll;
    setSelectAll(allSelected);

    const newSelectedRows = data.reduce<{ [key: string]: boolean }>(
      (acc, _, index) => {
        acc[index] = allSelected;
        return acc;
      },
      {}
    );
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-4xl mb-4">
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
                    {column}
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
                        ? JSON.stringify(row[column]) // Convert objects to string
                        : row[column]}
                    </td>
                  ))}
                  <td className="py-2">
                    <button
                      onClick={() => onEdit(row)} // Pass the row data to the callback
                      className="bg-profile text-white px-3 py-1 rounded-lg hover:bg-blue-500"
                    >
                      Editar
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
