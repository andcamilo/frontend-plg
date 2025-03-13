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
    const date = new Date(timestamp._seconds * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
                await axios.delete('/api/delete-request', { params: { solicitudId: id } });
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
    const canShowPagar = ((status !== 19 && (rol === "Cliente Recurrente" || rol === "Cliente")) || (rol === "Cliente Recurrente" || rol !== "Cliente"));

    return (
        <div className="flex gap-2">
            <Link href={`/dashboard/request?id=${id}`}>
                <VisibilityIcon className="cursor-pointer" titleAccess="Ver" />
            </Link>
            <Link href={getEditUrl()}>
                <EditIcon className="cursor-pointer" titleAccess="Editar" />
            </Link>
            {canShowPagar && (
                <Link href={`/dashboard/checkout?id=${id}`}>
                    <AttachMoneyIcon className="cursor-pointer" titleAccess="Pagar" />
                </Link>
            )}
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

    // Estados de paginación
    const [currentPageEnProceso, setCurrentPageEnProceso] = useState(1);
    const [paginationEnProceso, setPaginationEnProceso] = useState({
        hasPrevPage: false,
        hasNextPage: false,
        totalPages: 1,
    });

    const [currentPageFinalizadas, setCurrentPageFinalizadas] = useState(1);
    const [paginationFinalizadas, setPaginationFinalizadas] = useState({
        hasPrevPage: false,
        hasNextPage: false,
        totalPages: 1,
    });

    const [rowsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const userData = checkAuthToken();
                if (!userData) {
                    throw new Error("User is not authenticated.");
                }
                setFormData((prevData) => ({
                    ...prevData,
                    email: userData.email,
                    cuenta: userData.user_id,
                }));

                const userResponse = await axios.get('/api/get-user-cuenta', {
                    params: { userCuenta: userData.user_id },
                });

                const user = userResponse.data;
                const rawRole = get(user, 'solicitud.rol', 0);
                const roleMapping: { [key: number]: string } = {
                    99: "Super Admin",
                    90: "Administrador",
                    80: "Auditor",
                    50: "Caja Chica",
                    40: "Abogados",
                    35: "Asistente",
                    17: "Cliente recurrente",
                    10: "Cliente",
                };
                const stringRole = typeof rawRole === 'string' ? rawRole : roleMapping[rawRole] || "Desconocido";

                setFormData((prevData) => ({
                    ...prevData,
                    rol: stringRole,
                    userId: get(user, 'solicitud.id', ""),
                }));

                // Obtener TODAS las solicitudes una sola vez al cargar
                const { solicitudes: allSolicitudes } = await getRequests(1000, 1);

                setSolicitudes(allSolicitudes);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'An error occurred while fetching data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); // 🔥 Ahora el efecto solo se ejecuta una vez al montar el componente

    // ⚠️ Ahora movemos la paginación a otro efecto separado
    useEffect(() => {
        const solicitudesEnProceso = solicitudes.filter(solicitud => solicitud.status !== 70);
        const solicitudesFinalizadas = solicitudes.filter(solicitud => solicitud.status === 70);

        setPaginationEnProceso({
            hasPrevPage: currentPageEnProceso > 1,
            hasNextPage: currentPageEnProceso < Math.ceil(solicitudesEnProceso.length / rowsPerPage),
            totalPages: Math.ceil(solicitudesEnProceso.length / rowsPerPage),
        });

        setPaginationFinalizadas({
            hasPrevPage: currentPageFinalizadas > 1,
            hasNextPage: currentPageFinalizadas < Math.ceil(solicitudesFinalizadas.length / rowsPerPage),
            totalPages: Math.ceil(solicitudesFinalizadas.length / rowsPerPage),
        });
    }, [currentPageEnProceso, currentPageFinalizadas, solicitudes]); // 🔥 Ahora este efecto solo recalcula la paginación sin recargar los datos


    // Aplicar paginación
    const paginatedSolicitudesEnProceso = solicitudes
        .filter(solicitud =>
            solicitud.status !== 70 &&
            (!(formData.rol === 'Cliente' || formData.rol === 'Cliente recurrente') || solicitud.cuenta === formData.cuenta)
        )
        .slice((currentPageEnProceso - 1) * rowsPerPage, currentPageEnProceso * rowsPerPage);

    const paginatedSolicitudesFinalizadas = solicitudes
        .filter(solicitud =>
            solicitud.status === 70 &&
            (!(formData.rol === 'Cliente' || formData.rol === 'Cliente recurrente') || solicitud.cuenta === formData.cuenta)
        )
        .slice((currentPageFinalizadas - 1) * rowsPerPage, currentPageFinalizadas * rowsPerPage);

    // Transformar datos para la tabla
    const transformData = (solicitudes: any[]) => {
        return solicitudes.map(({ id, tipo, emailSolicita, date, status, expediente, abogados }) => {
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

            const tipoMapping: { [key: string]: string } = {
                "propuesta-legal": "Propuesta Legal",
                "consulta-legal": "Propuesta Legal",
                "consulta-escrita": "Consulta Escrita",
                "consulta-virtual": "Consulta Virtual",
                "consulta-presencial": "Consulta Presencial",
                "new-fundacion-interes-privado": "Fundación de Interés Privado",
                "new-sociedad-empresa": "Sociedad / Empresa",
                "menores-al-extranjero": "Salida de Menores al Extranjero",
                "pension-alimenticia": "Pensión Alimenticia",
                "tramite-general": "Trámite General",
                "pension-desacato": "Pensión Desacato",
                "solicitud-cliente-recurrente": "Solicitud Cliente Recurrente",
            };

            return {
                Tipo: tipoMapping[tipo] || tipo,
                Fecha: formatDate(date),
                Email: emailSolicita,
                Estatus: (
                    <span className={`status-badge ${statusClasses[status]}`}>
                        {statusLabels[status]}
                    </span>
                ),
                Expediente: expediente,
                Abogado: abogados.map((abogado: any) => abogado.nombre).join(', '),
                Opciones: <Actions tipo={tipo} id={id} status={status} rol={formData.rol} />
            };
        });
    };

    return (
        <div className="flex flex-col gap-4 p-8 w-full">
            {isLoading ? (
                <div className="text-center">Cargando...</div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <>
                    <TableWithRequests
                        data={transformData(paginatedSolicitudesEnProceso)}
                        rowsPerPage={rowsPerPage}
                        title="Últimas Solicitudes"
                        currentPage={currentPageEnProceso}
                        totalPages={paginationEnProceso.totalPages}
                        hasPrevPage={paginationEnProceso.hasPrevPage}
                        hasNextPage={paginationEnProceso.hasNextPage}
                        onPageChange={setCurrentPageEnProceso}
                    />

                    <TableWithRequests
                        data={transformData(paginatedSolicitudesFinalizadas)}
                        rowsPerPage={rowsPerPage}
                        title="Solicitudes Finalizadas"
                        currentPage={currentPageFinalizadas}
                        totalPages={paginationFinalizadas.totalPages}
                        hasPrevPage={paginationFinalizadas.hasPrevPage}
                        hasNextPage={paginationFinalizadas.hasNextPage}
                        onPageChange={setCurrentPageFinalizadas}
                    />
                </>
            )}
        </div>
    );
};

export default RequestsStatistics;
