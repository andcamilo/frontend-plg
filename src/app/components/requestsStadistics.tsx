import React, { useEffect, useState } from 'react';
import TableWithRequests from '@components/TableWithRequests';
import { getRequests } from '@api/request';

// Function to format date as dd/mm/yyyy
const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
    const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const RequestsStatistics: React.FC = () => {
    const [solicitudes, setSolicitudes] = useState<any[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        hasPrevPage: false,
        hasNextPage: false,
        totalPages: 1,
    });

    useEffect(() => {
        const fetchSolicitudes = async () => {
            try {
                const { solicitudes, pagination } = await getRequests(rowsPerPage, currentPage);

                // Sort the requests by date in descending order
                solicitudes.sort((a: any, b: any) => {
                    const dateA = new Date(a.date._seconds * 1000); // Convert to Date
                    const dateB = new Date(b.date._seconds * 1000);
                    return dateB.getTime() - dateA.getTime(); // Descending order
                });

                setSolicitudes(solicitudes);
                setPagination({
                    hasPrevPage: pagination.hasPrevPage,
                    hasNextPage: pagination.hasNextPage,
                    totalPages: pagination.totalPages,
                });

            } catch (error) {
                console.error('Failed to fetch solicitudes:', error);
            }
        };

        fetchSolicitudes();
    }, [currentPage, rowsPerPage]);

    // Filtered requests
    const solicitudesEnProceso = solicitudes.filter(solicitud => solicitud.status !== 70 && solicitud.status !== 1);
    const solicitudesFinalizadas = solicitudes.filter(solicitud => solicitud.status === 70);

    // Transform data for the table
    const transformData = (solicitudes) => {
        return solicitudes.map(({ tipo, emailSolicita, date, status, expediente, abogados }) => ({
            Tipo: tipo,
            Fecha: formatDate(date),
            Email: emailSolicita,
            Estatus: status,
            Expediente: expediente,
            Abogado: abogados.map((abogado: any) => abogado.nombre).join(', '), // Concatenating names
            Action: "...",
        }));
    };

    return (
        <div className="flex flex-col gap-4 p-8 w-full">

            {/* Últimas solicitudes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-3">
                    <TableWithRequests
                        data={transformData(solicitudesEnProceso)}
                        rowsPerPage={rowsPerPage}
                        title="Últimas Solicitudes"
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        hasPrevPage={pagination.hasPrevPage}
                        hasNextPage={pagination.hasNextPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Solicitudes Finalizadas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <div className="lg:col-span-3">
                    <TableWithRequests
                        data={transformData(solicitudesFinalizadas)}
                        rowsPerPage={rowsPerPage}
                        title="Solicitudes Finalizadas"
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        hasPrevPage={pagination.hasPrevPage}
                        hasNextPage={pagination.hasNextPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
        </div>
    );
};

export default RequestsStatistics;
