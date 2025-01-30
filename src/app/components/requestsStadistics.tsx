import React, { useEffect, useState } from 'react';
import TableWithRequests from '@components/TableWithRequests';
import { getRequests } from '@api/request';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Link from 'next/link';
import get from 'lodash/get';
import { checkAuthToken } from "@utils/checkAuthToken";

const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
    const date = new Date(timestamp._seconds * 1000); // Convert seconds to milliseconds
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// Mapa para convertir roles numéricos a strings
const roleMapping: { [key: number]: string } = {
    99: "Super Admin",
    90: "Administrador",
    80: "Auditor",
    50: "Caja Chica",
    40: "Abogados",
    35: "Asistente",
    17: "Cliente Recurrente",
    10: "Cliente",
};

const Actions: React.FC<{ tipo: string, id: string, status: number, rol: string }> = ({ tipo, id, status, rol }) => {
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
                Swal.fire({
                    title: 'Eliminado',
                    text: 'La solicitud ha sido eliminada.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Remove the deleted solicitud from the state instead of reloading
                // This requires lifting the state up or using a context/state management solution
                // For simplicity, we'll reload the page
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
                return `/request/fundacion?id=${id}`;
            case "new-sociedad-empresa":
                return `/request/sociedad-empresa?id=${id}`;
            case "menores-al-extranjero":
                return `/request/menores-extranjero?id=${id}`;
            case "pension":
                return `/request/pension-alimenticia?id=${id}`;
            case "tramite-general":
                return `/dashboard/tramite-general?id=${id}`;
            case "cliente-recurrente":
            case "solicitud-cliente-recurrente":
                return `/request/corporativo?id=${id}`;
            default:
                return `/request/consulta-propuesta?id=${id}`;
        }
    };

    const canShowDelete = ((status === 1 && (rol === "Cliente Recurrente" || rol === "Cliente")) || (rol === "Cliente Recurrente" || rol !== "Cliente"));

    return (
        <div className="flex gap-2">
            <Link href={`/dashboard/request?id=${id}`}>
                <VisibilityIcon className="cursor-pointer" titleAccess="Ver" />
            </Link>
            <Link href={getEditUrl()}>
                <EditIcon className="cursor-pointer" titleAccess="Editar" />
            </Link>
            <Link href={`/dashboard/checkout?id=${id}`}>
                <AttachMoneyIcon className="cursor-pointer" titleAccess="Pagar" />
            </Link>
            {canShowDelete && (
                <DeleteIcon
                    className="cursor-pointer"
                    onClick={handleDelete}
                    titleAccess="Eliminar"
                />
            )}
        </div>
    );
};

const RequestsStatistics: React.FC = () => {
    const [solicitudes, setSolicitudes] = useState<any[]>([]);
    const [formData, setFormData] = useState<{
        cuenta: string;
        email: string;
        rol: string;
        userId: string;
    }>({
        cuenta: "",
        email: "",
        rol: "",
        userId: "",
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage] = useState(10);
    const [pagination, setPagination] = useState({
        hasPrevPage: false,
        hasNextPage: false,
        totalPages: 1,
    });

    // Loading state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // 1. Check Auth Token and set formData.cuenta and email
                const userData = checkAuthToken();
                if (!userData) {
                    throw new Error("User is not authenticated.");
                }
                setFormData((prevData) => ({
                    ...prevData,
                    email: userData.email,
                    cuenta: userData.user_id,
                }));

                // 2. Fetch User Data based on cuenta
                console.log("Cuenta ", userData.user_id);
                const userResponse = await axios.get('/api/get-user-cuenta', {
                    params: { userCuenta: userData.user_id },
                });

                const user = userResponse.data;

                const rawRole = get(user, 'solicitud.rol', 0);
                const stringRole =
                    typeof rawRole === 'string'
                        ? rawRole // Si ya es un string, úsalo directamente
                        : roleMapping[rawRole] || "Desconocido";
                console.log('Rol recibido:', rawRole, 'Rol mapeado:', stringRole);
                setFormData((prevData) => ({
                    ...prevData,
                    rol: stringRole, // Asignar rol en formato string
                    userId: get(user, 'solicitud.id', ""),
                }));

                // 3. Fetch Solicitudes
                const { solicitudes: fetchedSolicitudes, pagination: fetchedPagination } = await getRequests(rowsPerPage, currentPage);

                solicitudesEnProceso = fetchedSolicitudes.filter((solicitud: any) => {
                    if (formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente") {
                        return solicitud.status !== 70;
                    } else {
                        return solicitud.status !== 70 && solicitud.cuenta === get(user, 'solicitud.id', "");
                    }
                }).sort((a: any, b: any) => {
                    const dateA = new Date(a.date._seconds * 1000); // Convert to Date
                    const dateB = new Date(b.date._seconds * 1000);
                    return dateB.getTime() - dateA.getTime(); // Descending order
                });

                solicitudesFinalizadas = fetchedSolicitudes.filter((solicitud: any) => {
                    if (formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente") {
                        return solicitud.status === 70;
                    } else {
                        return solicitud.status === 70 && solicitud.cuenta === get(user, 'solicitud.id', "");
                    }
                }).sort((a: any, b: any) => {
                    const dateA = new Date(a.date._seconds * 1000); // Convert to Date
                    const dateB = new Date(b.date._seconds * 1000);
                    return dateB.getTime() - dateA.getTime(); // Descending order
                });

                setSolicitudes(fetchedSolicitudes);
                setPagination({
                    hasPrevPage: fetchedPagination.hasPrevPage,
                    hasNextPage: fetchedPagination.hasNextPage,
                    totalPages: fetchedPagination.totalPages,
                });
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred while fetching data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [currentPage, rowsPerPage]);

    // Separate solicitudes based on status and user role
    let solicitudesEnProceso: any[] = [];
    let solicitudesFinalizadas: any[] = [];

    if (formData.rol !== "Cliente" && formData.rol !== "Cliente Recurrente") {
        // Filtered requests for roles > 17
        solicitudesEnProceso = solicitudes.filter(solicitud => solicitud.status !== 70 /* && solicitud.status !== 1 */);
        solicitudesFinalizadas = solicitudes.filter(solicitud => solicitud.status === 70);
    } else {
        // Filtered requests for roles <= 17
        solicitudesEnProceso = solicitudes.filter(solicitud => solicitud.status !== 70 && solicitud.cuenta === formData.userId);
        solicitudesFinalizadas = solicitudes.filter(solicitud => solicitud.status === 70 && solicitud.cuenta === formData.userId);
    }

    // Transform data for the table
    const transformData = (solicitudes: any[]) => {
        console.log("🚀 ~ transformData ~ solicitudes:", solicitudes);
        return solicitudes.map(({ id, tipo, emailSolicita, date, status, expediente, abogados }) => {
            // Map status values to their corresponding labels
            const statusLabels: { [key: number]: string } = {
                0: "Rechazada",
                1: "Borrador",
                10: "Enviada, pendiente de pago",
                12: "Aprobada",
                19: "Confirmando pago",
                20: "Pagada",
                30: "En proceso",
                70: "Finalizada",
            };

            // Map status to their corresponding CSS class
            const statusClasses: { [key: number]: string } = {
                0: "status-rechazada",
                1: "status-borrador",
                10: "status-enviada",
                12: "status-aprobada",
                19: "status-confirmando-pago",
                20: "status-pagada",
                30: "status-en-proceso",
                70: "status-finalizada",
            };

            const tipoLabels: { [key: string]: string } = {
                "propuesta-legal": "Propuesta Legal",
                "consulta-escrita": "Consulta Escrita",
                "consulta-virtual": "Consulta Virtual",
                "consulta-presencial": "Consulta Presencial",
                "new-fundacion": "Fundaciones de Interés Privado",
                "new-sociedad-empresa": "Sociedad / Empresa",
                "menores-al-extranjero": "Salida de Menores al Extranjero",
                "pension": "Pensión Alimenticia",
                "tramite-general": "Tramite General",
                "cliente-recurrente": "Cliente Recurrente",
                "solicitud-cliente-recurrente": "Cliente Recurrente",
            };

            return {
                Tipo: tipoLabels[tipo] || tipo,
                Fecha: formatDate(date),
                Email: emailSolicita,
                Estatus: (
                    <span className={`status-badge ${statusClasses[status]}`}>
                        {statusLabels[status]}
                    </span>
                ), // Renderiza el estado con su clase correspondiente
                Expediente: expediente,
                Abogado: abogados.map((abogado: any) => abogado.nombre).join(', '), // Concatenando nombres
                Opciones: <Actions tipo={tipo} id={id} status={status} rol={formData.rol} /> // Pasando el id como prop al componente de acciones
            };
        });
    };

    return (
        <div className="flex flex-col gap-4 p-8 w-full">
            {isLoading ? (
                // Loading Indicator
                <div className="flex justify-center items-center h-64">
                    <svg
                        className="animate-spin h-10 w-10 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                    </svg>
                </div>
            ) : error ? (
                // Error Message
                <div className="flex justify-center items-center h-64">
                    <p className="text-red-500 text-lg">{error}</p>
                </div>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
};

export default RequestsStatistics;
