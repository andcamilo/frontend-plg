import React, { useState } from 'react';

interface Request {
  type: string;
  email: string;
  date: string;
  status: string;
}

interface TableWithPaginationProps {
  data: Request[];
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

  return (
    <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full max-w-4xl mb-4">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      <table className="w-full text-left text-gray-400">
        <thead>
          <tr>
            <th className="py-2">Tipo</th>
            <th className="py-2">Fecha</th>
            <th className="py-2">Estatus</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((request, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="py-2">
                <div className="font-semibold">{request.type}</div>
                <div className="text-sm text-pink-500">{request.email}</div>
              </td>
              <td className="py-2">{request.date}</td>
              <td className="py-2">
                <span className={`px-2 py-1 rounded-full text-sm font-semibold ${request.status === 'Pagada' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {request.status}
                </span>
              </td>
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
