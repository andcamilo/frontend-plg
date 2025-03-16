import React, { useEffect, useState } from 'react';
import TableWithRequests from '@components/TableWithRequests';
import { getCasos } from '@api/requestCasos';
import axios from 'axios';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Link from 'next/link';
import get from 'lodash/get';
import { checkAuthToken } from "@utils/checkAuthToken";

const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
    const date = new Date(timestamp._seconds * 1000);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
};

const Actions: React.FC<{ id: string, status: number, rol: string }> = ({ id, status, rol }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¿Quieres eliminar este caso?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
        });

        if (result.isConfirmed) {
            try {
                await axios.delete('/api/delete-request-casos', { params: { solicitudId: id } });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El caso ha sido eliminado.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar el caso:', error);
                Swal.fire('Error', 'No se pudo eliminar el caso.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <Link href={`/dashboard/caso?id=${id}`}>
                <VisibilityIcon className="cursor-pointer" titleAccess="Ver" />
            </Link>
            <Link href={`/request/casos-resumen?id=${id}`}>
                <EditIcon className="cursor-pointer" titleAccess="Editar" />
            </Link>
            <DeleteIcon className="cursor-pointer text-red-500" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const CasosStatistics: React.FC = () => {
    const [casos, setCasos] = useState<any[]>([]);
    const [formData, setFormData] = useState<{ cuenta: string; email: string; rol: string; userId: string }>({
        cuenta: "",
        email: "",
        rol: "",
        userId: "",
    });

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
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
                if (!userData) throw new Error("Usuario no autenticado.");

                setFormData(prevData => ({
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

                setFormData(prevData => ({
                    ...prevData,
                    rol: stringRole,
                    userId: get(user, 'solicitud.id', ""),
                }));

                // Obtener los casos paginados
                const { casos, pagination } = await getCasos(10, 1);
                setCasos(casos);
                setPagination(pagination);
            } catch (err: any) {
                console.error('Error fetching cases:', err);
                setError(err.message || 'Ocurrió un error al obtener los casos.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Aplicar paginación
    const paginatedCasos = casos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Transformar datos para la tabla
    const transformData = (casos: any[]) => {
        return casos.map(({ id, summaryEmail, date, status, expediente }) => {
            const statusLabels: { [key: number]: string } = {
                0: "Rechazado",
                1: "Borrador",
                10: "Enviado",
                12: "Aprobado",
                19: "Confirmando pago",
                20: "Pagado",
                30: "En proceso",
                70: "Finalizado",
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

            return {
                Fecha: formatDate(date),
                Email: summaryEmail,
                Estatus: (
                    <span className={`status-badge ${statusClasses[status]}`}>
                        {statusLabels[status]}
                    </span>
                ),
                Expediente: expediente,
                Opciones: <Actions id={id} status={status} rol={formData.rol} />
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
                <TableWithRequests
                    data={transformData(paginatedCasos)}
                    rowsPerPage={rowsPerPage}
                    title="Últimos Casos"
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    hasPrevPage={pagination.hasPrevPage}
                    hasNextPage={pagination.hasNextPage}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default CasosStatistics;
