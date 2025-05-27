import React from 'react';

interface TableWithPaginationProps {
  data: { [key: string]: any }[];
  rowsPerPage: number;
  title: string;
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (pageNumber: number) => void;
}

const TableWithPagination: React.FC<TableWithPaginationProps> = ({
  data,
  rowsPerPage,
  title,
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  onPageChange,
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-7xl mb-4">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <div className="overflow-x-auto">
        {data.length > 0 ? (
          <table className="w-full text-left text-gray-400">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th key={index} className="py-2 capitalize text-white">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-700">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-2">
                      {React.isValidElement(row[column]) ? (
                        row[column] // Si es un elemento React, lo renderizamos directamente
                      ) : typeof row[column] === 'object' && row[column] !== null ? (
                        JSON.stringify(row[column]) // Convertimos objetos normales a string
                      ) : (
                        row[column] // Renderizamos directamente otros valores
                      )}
                    </td>

                  ))}
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

export default TableWithPagination;
