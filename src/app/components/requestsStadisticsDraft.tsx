"use client"
import React, { useEffect, useState, useMemo } from 'react';
import TableWithRequests from '@components/TableWithRequests';
import { getRequestsCuenta } from '@api/request-cuenta';
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
import { Rol } from '@constants/roles';

const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }): string => {
  const date = new Date(timestamp._seconds * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Actions: React.FC<{ tipo: string; id: string; status: number; rol: string }> = ({
  tipo,
  id,
  status,
  rol,
}) => {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Quiere eliminar esta solicitud?',
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
        // For simplicity, we reload the page
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar la solicitud:', error);
        Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
      }
    }
  };

  const getEditUrl = () => {
    switch (tipo) {
      case 'new-fundacion':
        return `/request/fundacion/${id}`;
      case 'new-sociedad-empresa':
        return `/request/sociedad-empresa/${id}`;
      case 'menores-al-extranjero':
        return `/request/menores-extranjero/${id}`;
      case 'pension':
        return `/request/pension-alimenticia/${id}`;
      case 'pension-alimenticia':
        return `/request/pension-alimenticia/${id}`;
      case 'tramite-general':
        return `/dashboard/tramite-general/${id}`;
      case 'cliente-recurrente':
      case 'solicitud-cliente-recurrente':
        return `/request/corporativo/${id}`;
      default:
        return `/request/consulta-propuesta/${id}`;
    }
  };

  // Logic for showing the delete/pay icons
  const canShowDelete =
    (status === 1 && (rol === Rol.CLIENTE_RECURRENTE || rol === Rol.CLIENTE)) ||
    (rol !== Rol.CLIENTE_RECURRENTE && rol !== Rol.CLIENTE && rol !== Rol.ASISTENTE && rol !== Rol.ABOGADOS);

  const canShowPagar =
    (status < 19 && (rol === Rol.CLIENTE_RECURRENTE || rol === Rol.CLIENTE)) ||
    (rol !== Rol.CLIENTE_RECURRENTE && rol !== Rol.CLIENTE);

  return (
    <div className="flex gap-2">
      <Link href={`/dashboard/request/${id}`}>
        <VisibilityIcon className="cursor-pointer" titleAccess="Ver" />
      </Link>
      <Link href={getEditUrl()}>
        <EditIcon className="cursor-pointer" titleAccess="Editar" />
      </Link>
      {canShowPagar && (
        <Link href={`/dashboard/checkout/${id}`}>
          <AttachMoneyIcon className="cursor-pointer" titleAccess="Pagar" />
        </Link>
      )}
      {canShowDelete && (
        <DeleteIcon
          className="cursor-pointer text-red-500"
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
    cuenta: '',
    email: '',
    rol: '',
    userId: '',
  });

  // Local pagination states
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

  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterExpediente, setFilterExpediente] = useState('');

  const hayFiltrosActivos = filterTipo || filterStatus || filterDate || filterExpediente;

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const userData = checkAuthToken();
        if (!userData) {
          throw new Error('User is not authenticated.');
        }
        // store user info
        setFormData((prevData) => ({
          ...prevData,
          email: userData.email,
          cuenta: userData.user_id,
        }));

        // fetch user info to get role
        const userResponse = await axios.get('/api/get-user-cuenta', {
          params: { userCuenta: userData.user_id },
        });
        const user = userResponse.data;

        const rawRole = get(user, 'solicitud.rol', 0);
        const roleMapping: { [key: number]: string } = {
          99: Rol.SUPER_ADMIN,
          90: Rol.ADMINISTRADOR,
          80: Rol.AUDITOR,
          50: Rol.CAJA_CHICA,
          40: Rol.ABOGADOS,
          35: Rol.ASISTENTE,
          17: Rol.CLIENTE_RECURRENTE,
          10: Rol.CLIENTE,
        };
        const stringRole =
          typeof rawRole === 'string' ? rawRole : roleMapping[rawRole] || 'Desconocido';

        setFormData((prevData) => ({
          ...prevData,
          rol: stringRole,
          userId: get(user, 'solicitud.id', ''),
        }));

        // Fetch the “big chunk” of requests once
        let entireSolicitudes;
        if (
          (typeof rawRole === 'number' && rawRole < 20) ||
          (typeof stringRole === 'string' && (stringRole === Rol.CLIENTE || stringRole === Rol.CLIENTE_RECURRENTE))
        ) {
          const result = await getRequestsCuenta(1000, userData.user_id, null);
          entireSolicitudes = result.solicitudes;
        } else {
          const result = await getRequests(userData.email, 1000, 1);
          entireSolicitudes = result.solicitudes;
        }

        setSolicitudes(entireSolicitudes);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // ---- Helper function for filtering ----
  const getSolicitudesFiltradas = (array: any[]) => {
    return array
      // If user is Rol.CLIENTE or "cliente recurrente", show only docs where solicitud.cuenta === userData.cuenta
      .filter((solicitud) => {
        const esCliente = formData.rol === Rol.CLIENTE || formData.rol === Rol.CLIENTE_RECURRENTE;
        const esAsistenteOAbogado = formData.rol === Rol.ASISTENTE || formData.rol === Rol.ABOGADOS;

        if (esCliente) {
          return solicitud.cuenta === formData.cuenta;
        }

        if (esAsistenteOAbogado) {
          const abogadoAsignado = (solicitud.abogados || []).some((abogado: any) =>
            abogado.id === formData.userId || abogado._id === formData.userId
          );
          return solicitud.cuenta === formData.cuenta || abogadoAsignado;
        }

        // Para todos los demás roles (Admin, etc.)
        return true;
      })
      // apply local filters
      .filter(({ tipo, date, status, expediente }) => {
        const tipoMapping: { [key: string]: string } = {
          'propuesta-legal': 'Propuesta Legal',
          'consulta-legal': 'Propuesta Legal',
          'consulta-escrita': 'Consulta Escrita',
          'consulta-virtual': 'Consulta Virtual',
          'consulta-presencial': 'Consulta Presencial',
          'new-fundacion': 'Fundación de Interés Privado',
          'new-sociedad-empresa': 'Sociedad / Empresa',
          'menores-al-extranjero': 'Salida de Menores al Extranjero',
          'pension-alimenticia': 'Pensión Alimenticia',
          pension: 'Pensión Alimenticia',
          'tramite-general': 'Trámite General',
          'pension-desacato': 'Pensión Desacato',
          'solicitud-cliente-recurrente': 'Solicitud Cliente Recurrente',
        };

        const tipoTexto = tipoMapping[tipo] || tipo;
        const formattedDate = formatDate(date);
        const inputDate = filterDate ? filterDate.split('-').reverse().join('/') : '';

        return (
          (filterTipo ? tipoTexto === filterTipo : true) &&
          (filterStatus ? status.toString() === filterStatus : true) &&
          (filterDate ? formattedDate === inputDate : true) &&
          (filterExpediente
            ? expediente?.toLowerCase().includes(filterExpediente.toLowerCase())
            : true)
        );
      })
      // sort descending by date
      .sort((a, b) => b.date._seconds - a.date._seconds);
  };

  // ---- Memoized filtering so the arrays are stable if data/filters haven't changed ----
  const solicitudesFiltradasEnProceso = useMemo(() => {
    return getSolicitudesFiltradas(
      solicitudes.filter((solicitud) => solicitud.status === 1)
    );
  }, [
    solicitudes,
    formData.rol,
    formData.cuenta,
    filterTipo,
    filterStatus,
    filterDate,
    filterExpediente,
  ]);

  // ---- Pagination slices ----
  const paginatedSolicitudesEnProceso = solicitudesFiltradasEnProceso.slice(
    (currentPageEnProceso - 1) * rowsPerPage,
    currentPageEnProceso * rowsPerPage
  );

  const totalPagesEnProceso = useMemo(() => {
    return Math.max(1, Math.ceil(solicitudesFiltradasEnProceso.length / rowsPerPage));
  }, [solicitudesFiltradasEnProceso, rowsPerPage]);  

  useEffect(() => {
    if (solicitudesFiltradasEnProceso.length === 0) return;
  
    const totalPages = Math.max(1, Math.ceil(solicitudesFiltradasEnProceso.length / rowsPerPage));
    setPaginationEnProceso({
      hasPrevPage: currentPageEnProceso > 1,
      hasNextPage: currentPageEnProceso < totalPages,
      totalPages,
    });
  }, [solicitudesFiltradasEnProceso, currentPageEnProceso, rowsPerPage]);  
  
  // ---- Format the data for <TableWithRequests> ----
  const transformData = (solicitudes: any[]) => {
    return solicitudes.map(
      ({ id, tipo, emailSolicita, date, status, expediente, abogados }) => {
        const statusLabels: { [key: number]: string } = {
          0: 'Rechazada',
          1: 'Borrador',
          10: 'Pendiente de pago',
          12: 'Aprobada',
          19: 'Confirmando pago',
          20: 'Pagada',
          30: 'En proceso',
          70: 'Finalizada',
        };

        const statusClasses: { [key: number]: string } = {
          0: 'status-rechazada',
          1: 'status-borrador',
          10: 'status-enviada',
          12: 'status-aprobada',
          19: 'status-confirmando-pago',
          20: 'status-pagada',
          30: 'status-en-proceso',
          70: 'status-finalizada',
        };

        const tipoMapping: { [key: string]: string } = {
          'propuesta-legal': 'Propuesta Legal',
          'consulta-legal': 'Propuesta Legal',
          'consulta-escrita': 'Consulta Escrita',
          'consulta-virtual': 'Consulta Virtual',
          'consulta-presencial': 'Consulta Presencial',
          'new-fundacion': 'Fundación de Interés Privado',
          'new-sociedad-empresa': 'Sociedad / Empresa',
          'menores-al-extranjero': 'Salida de Menores al Extranjero',
          'pension-alimenticia': 'Pensión Alimenticia',
          pension: 'Pensión Alimenticia',
          'tramite-general': 'Trámite General',
          'pension-desacato': 'Pensión Desacato',
          'solicitud-cliente-recurrente': 'Solicitud Cliente Recurrente',
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
          Opciones: <Actions tipo={tipo} id={id} status={status} rol={formData.rol} />,
        };
      }
    );
  };

  // Possible select options
  const tiposDisponibles = [
    'Propuesta Legal',
    'Consulta Escrita',
    'Consulta Virtual',
    'Consulta Presencial',
    'Fundación de Interés Privado',
    'Sociedad / Empresa',
    'Salida de Menores al Extranjero',
    'Pensión Alimenticia',
    'Trámite General',
    'Solicitud Cliente Recurrente',
  ];

  const estatusDisponibles = [
    { value: 0, label: 'Rechazada' },
    { value: 1, label: 'Borrador' },
    { value: 10, label: 'Pendiente de pago' },
    { value: 12, label: 'Aprobada' },
    { value: 19, label: 'Confirmando pago' },
    { value: 20, label: 'Pagada' },
    { value: 30, label: 'En proceso' },
    { value: 70, label: 'Finalizada' },
  ];

  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      {isLoading ? (
        <div className="text-center">Cargando...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {/* --- Filters --- */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <select
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              value={filterTipo}
              onChange={(e) => {
                setFilterTipo(e.target.value);
                setCurrentPageEnProceso(1);
                setCurrentPageFinalizadas(1);
              }}
            >
              <option value="">Todos los tipos</option>
              {tiposDisponibles.map((tipo, index) => (
                <option key={index} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setCurrentPageEnProceso(1);
                setCurrentPageFinalizadas(1);
              }}
            />

            <input
              type="text"
              placeholder="Buscar expediente..."
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              value={filterExpediente}
              onChange={(e) => {
                setFilterExpediente(e.target.value);
                setCurrentPageEnProceso(1);
                setCurrentPageFinalizadas(1);
              }}
            />
          </div>

          {/* --- Table of “En Proceso” --- */}
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
        </>
      )}
    </div>
  );
};

export default RequestsStatistics;
