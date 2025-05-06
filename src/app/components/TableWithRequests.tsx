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

const TableWithRequests: React.FC<TableWithPaginationProps> = ({
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
        <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full mb-4" style={{ maxWidth: '100%' }}>
            <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
            <div className="overflow-x-auto">
                {data.length > 0 ? (
                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[900px]">
                            <table className="w-full text-left text-gray-400 border-collapse">
                                <thead>
                                    <tr>
                                        {columns.map((column, index) => (
                                            <th
                                                key={index}
                                                className="py-2 px-4 capitalize text-white whitespace-nowrap"
                                            >
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-t border-gray-700">
                                            {columns.map((column, colIndex) => (
                                                <td
                                                    key={colIndex}
                                                    className="py-2 px-4 align-top whitespace-nowrap"
                                                >
                                                    {column.toLowerCase() === 'abogado' && typeof row[column] === 'string'
                                                        ? row[column]
                                                            .split(',')
                                                            .map((lawyer: string, idx: number) => (
                                                                <div key={idx}>{lawyer.trim()}</div>
                                                            ))
                                                        : row[column]}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
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

export default TableWithRequests;
