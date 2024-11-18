import React, { useEffect, useState } from 'react';
import TableWithRequests from '@components/TableWithRequests';
import { getRequests } from '@api/request';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

// Function to format date as dd/mm/yyyy
const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
    const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Componente para los íconos de acciones
const Actions: React.FC<{ tipo: string, id: string }> = ({ tipo, id }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar esta solicitud?",
            icon: 'warning',
            showCancelButton: true,
            background: '#2c2c3e',
            color: '#fff',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/delete-request`, { params: { solicitudId: id } });
                Swal.fire('Eliminado', 'La solicitud ha sido eliminada.', 'success');
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar la solicitud:', error);
                Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
            }
        }
    };

    const getEditUrl = () => {
        switch (tipo) {
            case "new-fundacion":
                return `http://localhost:3000/request/fundacion?id=${id}`;
            case "new-sociedad-empresa":
                return `http://localhost:3000/request/sociedad-empresa?id=${id}`;
            case "menores-al-extranjero":
                return `http://localhost:3000/request/menores-extranjero?id=${id}`;
            default:
                return `http://localhost:3000/request/consulta-propuesta?id=${id}`;
        }
    };

    return (
        <div className="flex gap-2">
            <a href={`http://localhost:3000/dashboard/request?id=${id}`}>
                <VisibilityIcon className="cursor-pointer" titleAccess="Ver" />
            </a>
            <a href={getEditUrl()}>
                <EditIcon className="cursor-pointer" titleAccess="Editar" />
            </a>
            <a href={`http://localhost:3000/dashboard/checkout?id=${id}`}>
                <AttachMoneyIcon className="cursor-pointer" titleAccess="Pagar" />
            </a>
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
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
    const solicitudesEnProceso = solicitudes.filter(solicitud => solicitud.status !== 70 /* && solicitud.status !== 1 */);
    const solicitudesFinalizadas = solicitudes.filter(solicitud => solicitud.status === 70 );

    // Transform data for the table
    const transformData = (solicitudes) => {
        return solicitudes.map(({ id, tipo, emailSolicita, date, status, expediente, abogados }) => {
            // Map status values to their corresponding labels
            const statusLabels = {
                0: "Rechazada",
                1: "Borrador",
                10: "Enviada",
                12: "Aprobada",
                19: "Confirmando pago",
                20: "Pagada",
                30: "En proceso",
                70: "Finalizada",
            };
    
            // Map status to their corresponding CSS class
            const statusClasses = {
                0: "status-rechazada",
                1: "status-borrador",
                10: "status-enviada",
                12: "status-aprobada",
                19: "status-confirmando-pago",
                20: "status-pagada",
                30: "status-en-proceso",
                70: "status-finalizada",
            };

            const tipoLabels = {
                "propuesta-legal": "Propuesta Legal",
                "consulta-escrita": "Consulta Escrita",
                "consulta-virtual": "Consulta Virtual",
                "consulta-presencial": "Consulta Presencial",
                "new-fundacion": "Fundaciones de Interés Privado",
                "new-sociedad-empresa": "Sociedad / Empresa",
                "menores-al-extranjero": "Salida de Menores al Extranjero",
                "pension": "Pensión Alimenticia",
            };
    
            return {
                Tipo: tipoLabels[tipo],
                Fecha: formatDate(date),
                Email: emailSolicita,
                Estatus: (
                    <span className={`status-badge ${statusClasses[status]}`}>
                        {statusLabels[status]}
                    </span>
                ), // Renderiza el estado con su clase correspondiente
                Expediente: expediente,
                Abogado: abogados.map((abogado) => abogado.nombre).join(', '), // Concatenando nombres
                Action: <Actions tipo={tipo} id={id} /> // Pasando el id como prop al componente de acciones
            };
        });
    };
    
    return (
        <div className="flex flex-col gap-4 p-8 w-full">
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
