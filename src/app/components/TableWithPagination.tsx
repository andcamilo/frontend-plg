import React, { useState } from 'react';

interface TableWithPaginationProps {
  data: { [key: string]: any }[];
  rowsPerPage: number;
  title: string;
}

const TableWithPagination: React.FC<TableWithPaginationProps> = ({ data, rowsPerPage, title }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Dynamically generate column headers from the keys of the first object in the data array
  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full max-w-4xl mb-4">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <table className="w-full text-left text-gray-400">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="py-2 capitalize">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-gray-700">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="py-2">
                  {row[column]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <div className="text-gray-400">
          Página {currentPage} de {totalPages}
        </div>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default TableWithPagination;