"use client"
import React, { useEffect, useState, useMemo } from 'react';
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
      case "pension-alimenticia":
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
    (status === 1 && (rol === 'cliente recurrente' || rol === 'cliente')) ||
    (rol !== 'cliente recurrente' && rol !== 'cliente' && rol !== 'Asistente' && rol !== 'Abogados');

  const canShowPagar =
    ![12, 20, 30, 70].includes(status) && (
      (status < 19 && (rol === 'cliente recurrente' || rol === 'cliente')) ||
      (rol !== 'cliente recurrente' && rol !== 'cliente')
    );

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
  const [filtroContador, setFiltroContador] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<{ [key: string]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);

  const hayFiltrosActivos = filterTipo || filterStatus || filterDate || filterExpediente;

  // ✅ Agrega aquí esta función ↓↓↓↓↓↓↓↓↓↓
  const getSolicitudesVisiblesPorRol = () => {
    return solicitudes.filter((solicitud) => {
      const esCliente = formData.rol === 'cliente' || formData.rol === 'cliente recurrente';
      const esAsistenteOAbogado = formData.rol === 'Asistente' || formData.rol === 'Abogados';

      if (esCliente) {
        return solicitud.cuenta === formData.cuenta;
      }

      if (esAsistenteOAbogado) {
        const abogadoAsignado = (solicitud.abogados || []).some((abogado: any) =>
          abogado.id === formData.userId || abogado._id === formData.userId
        );
        return solicitud.cuenta === formData.cuenta || abogadoAsignado;
      }

      return true;
    });
  };

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
          99: 'Super Admin',
          90: 'Administrador',
          80: 'Auditor',
          50: 'Caja Chica',
          40: 'Abogados',
          35: 'Asistente',
          17: 'cliente recurrente',
          10: 'cliente',
        };
        const stringRole =
          typeof rawRole === 'string' ? rawRole : roleMapping[rawRole] || 'Desconocido';

        setFormData((prevData) => ({
          ...prevData,
          rol: stringRole,
          userId: get(user, 'solicitud.id', ''),
        }));

        // Fetch the "big chunk" of requests once
        const { solicitudes: entireSolicitudes } = await getRequests(
          userData.email, // though you never use email on the server?
          1000,           // large limit
          1,              // always page 1
          rawRole      // pass the user's role
        );

        console.log("🚀 ~ fetchData ~ solicitudes:", entireSolicitudes)
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
      .filter((solicitud) => {
        const esCliente = formData.rol === 'cliente' || formData.rol === 'cliente recurrente';
        const esAsistenteOAbogado = formData.rol === 'Asistente' || formData.rol === 'Abogados';

        if (esCliente) {
          return solicitud.cuenta === formData.cuenta;
        }

        if (esAsistenteOAbogado) {
          const abogadoAsignado = (solicitud.abogados || []).some((abogado: any) =>
            abogado.id === formData.userId || abogado._id === formData.userId
          );
          return solicitud.cuenta === formData.cuenta || abogadoAsignado;
        }

        return true;
      })
      .filter(({ tipo, date, status, expediente, expedienteType, abogados }) => {
        const tipoMapping: { [key: string]: string } = {
          'propuesta-legal': 'Propuesta Legal',
          'consulta-legal': 'Propuesta Legal',
          'consulta-escrita': 'Consulta Escrita',
          'consulta-virtual': 'Consulta Virtual',
          'consulta-presencial': 'Consulta Presencial',
          'new-fundacion-interes-privado': 'Fundación de Interés Privado',
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

        const pasaFiltrosNormales =
          (filterTipo ? tipoTexto === filterTipo : true) &&
          (filterStatus ? status.toString() === filterStatus : true) &&
          (filterDate ? formattedDate === inputDate : true) &&
          (filterExpediente
            ? expediente?.toLowerCase().includes(filterExpediente.toLowerCase())
            : true);

        const pasaFiltroContador =
          filtroContador === ''
          || (filtroContador === 'nuevas' && (!abogados || abogados.length === 0) && status >= 2 && status !== 70)
          || (filtroContador === 'pagadas' && status === 20)
          || (filtroContador === 'pendiente' && status === 10)
          || (filtroContador === 'tramite' && status === 30);

        return pasaFiltrosNormales && pasaFiltroContador;
      })
      .sort((a, b) => b.date._seconds - a.date._seconds);
  };

  // ---- Memoized filtering so the arrays are stable if data/filters haven't changed ----
  const solicitudesFiltradasEnProceso = useMemo(() => {
    return getSolicitudesFiltradas(
      solicitudes.filter((solicitud) => ![70, 1].includes(solicitud.status))
    );
  }, [
    solicitudes,
    formData.rol,
    formData.cuenta,
    filterTipo,
    filterStatus,
    filterDate,
    filterExpediente,
    filtroContador,
  ]);

  const solicitudesFiltradasFinalizadas = useMemo(() => {
    return getSolicitudesFiltradas(
      solicitudes.filter((solicitud) => solicitud.status === 70)
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
  const paginatedSolicitudesFinalizadas = solicitudesFiltradasFinalizadas.slice(
    (currentPageFinalizadas - 1) * rowsPerPage,
    currentPageFinalizadas * rowsPerPage
  );

  // ---- Effects to update pagination states ----
  useEffect(() => {
    setPaginationEnProceso({
      hasPrevPage: currentPageEnProceso > 1,
      hasNextPage:
        currentPageEnProceso <
        Math.ceil(solicitudesFiltradasEnProceso.length / rowsPerPage),
      totalPages: Math.max(
        1,
        Math.ceil(solicitudesFiltradasEnProceso.length / rowsPerPage)
      ),
    });
  }, [currentPageEnProceso, solicitudesFiltradasEnProceso, rowsPerPage]);

  useEffect(() => {
    setPaginationFinalizadas({
      hasPrevPage: currentPageFinalizadas > 1,
      hasNextPage:
        currentPageFinalizadas <
        Math.ceil(solicitudesFiltradasFinalizadas.length / rowsPerPage),
      totalPages: Math.max(
        1,
        Math.ceil(solicitudesFiltradasFinalizadas.length / rowsPerPage)
      ),
    });
  }, [currentPageFinalizadas, solicitudesFiltradasFinalizadas, rowsPerPage]);

  // ---- Format the data for <TableWithRequests> ----
  const transformData = (solicitudes: any[]) => {
    return solicitudes.map(
      ({ id, tipo, emailSolicita, date, status, expediente, expedienteType, abogados }, index) => {
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
          'new-fundacion-interes-privado': 'Fundación de Interés Privado',
          'new-fundacion': 'Fundación de Interés Privado',
          'new-sociedad-empresa': 'Sociedad / Empresa',
          'menores-al-extranjero': 'Salida de Menores al Extranjero',
          'pension-alimenticia': 'Pensión Alimenticia',
          pension: 'Pensión Alimenticia',
          'tramite-general': 'Trámite General',
          'pension-desacato': 'Pensión Desacato',
          'solicitud-cliente-recurrente': 'Solicitud Cliente Recurrente',
        };

        const expedienteTypeClasses: { [key: string]: string } = {
          'Migración': 'status-aprobada',
          'Corporativo': 'status-en-proceso',
          'Consultas y Propuestas': 'status-enviada',
          'Familia': 'status-pagada',
          'Propiedad Intelectual': 'status-rechazada',
          'Dirección General de Ingresos': 'status-confirmando-pago',
          'Laboral': 'status-finalizada',
          'Propiedades': 'status-borrador',
          'Otros': 'status-borrador',
        };
        const expedienteClass = (expedienteType && expedienteType !== '-')
          ? (expedienteTypeClasses[expedienteType] || 'status-borrador')
          : 'status-borrador';

        // --- Expediente type mapping logic ---
        const validTypes = [
          'propuesta-legal',
          'consulta-escrita',
          'consulta-virtual',
          'consulta-presencial',
          'new-fundacion-interes-privado',
          'new-sociedad-empresa',
          'menores-al-extranjero',
          'pension',
          'pension-alimenticia',
        ];
        let mappedExpedienteType = '';
        if (tipo && validTypes.includes(tipo)) {
          if ([
            'propuesta-legal',
            'consulta-escrita',
            'consulta-virtual',
            'consulta-presencial'
          ].includes(tipo)) {
            mappedExpedienteType = 'Consultas y Propuestas';
          } else if ([
            'new-fundacion-interes-privado',
            'new-sociedad-empresa'
          ].includes(tipo)) {
            mappedExpedienteType = 'Corporativo';
          } else if (tipo === 'menores-al-extranjero') {
            mappedExpedienteType = 'Migración';
          } else if (tipo === 'pension' || tipo === 'pension-alimenticia') {
            mappedExpedienteType = 'Familia';
          }
        }

        return {
          id,
          Tipo: tipoMapping[tipo] || tipo,
          Fecha: formatDate(date),
          Email: emailSolicita,
          Estatus: (
            <span className={`status-badge ${statusClasses[status]}`}>
              {statusLabels[status]}
            </span>
          ),
          'Tipo de Expediente': (
            <span className={`status-badge ${expedienteClass}`}>
              {mappedExpedienteType || '-'}
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
    /* { value: 1, label: 'Borrador' }, */
    { value: 10, label: 'Pendiente de pago' },
    { value: 12, label: 'Aprobada' },
    { value: 19, label: 'Confirmando pago' },
    { value: 20, label: 'Pagada' },
    { value: 30, label: 'En proceso' },
    /* { value: 70, label: 'Finalizada' }, */
  ];

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = (rows: any[]) => {
    const allSelected = !selectAll;
    setSelectAll(allSelected);

    const newSelection: { [key: string]: boolean } = {};
    rows.forEach((row) => {
      newSelection[row.ID] = allSelected;
    });

    setSelectedRows(newSelection);
  };

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(selectedRows).filter((id) => selectedRows[id]);

    if (selectedIds.length === 0) {
      Swal.fire('Atención', 'No has seleccionado ninguna solicitud.', 'info');
      return;
    }

    const confirm = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás ${selectedIds.length} solicitudes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#2c2c3e',
      color: '#fff',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.post('/api/delete-multiple-requests', {
          solicitudIds: selectedIds,
        });

        Swal.fire('Eliminadas', 'Solicitudes eliminadas correctamente.', 'success');
        window.location.reload();
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire('Error', 'Hubo un problema al eliminar las solicitudes.', 'error');
      }
    }
  };

  const deleteButtonHeader = (
    Object.values(selectedRows).some(Boolean) && (
      <div className="flex justify-end mb-4">
        <button
          onClick={handleDeleteSelected}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
        >
          Eliminar seleccionados
        </button>
      </div>
    )
  );

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

            <select
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPageEnProceso(1);
                setCurrentPageFinalizadas(1);
              }}
            >
              <option value="">Todos los estatus</option>
              {estatusDisponibles.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
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

          {/* --- Contadores de solicitudes --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => {
                setFiltroContador('nuevas');
                setCurrentPageEnProceso(1);
              }}
              className={`bg-profile text-white text-center rounded-lg py-4 shadow-md hover:opacity-80 transition ${filtroContador === 'nuevas' ? 'ring-2 ring-white' : ''
                }`}
            >
              <div className="text-sm md:text-base">
                Nuevas Solicitudes: <strong>
                  {
                    getSolicitudesVisiblesPorRol().filter(s => (!s.abogados || s.abogados.length === 0) && s.status > 1 && s.status !== 70).length
                  }
                </strong>
              </div>
            </button>

            <button
              onClick={() => {
                setFiltroContador('pagadas');
                setCurrentPageEnProceso(1);
              }}
              className={`bg-profile text-white text-center rounded-lg py-4 shadow-md hover:opacity-80 transition ${filtroContador === 'pagadas' ? 'ring-2 ring-white' : ''
                }`}
            >
              <div className="text-sm md:text-base">Pagadas: <strong>{getSolicitudesVisiblesPorRol().filter(s => s.status === 20).length}</strong></div>
            </button>

            <button
              onClick={() => {
                setFiltroContador('pendiente');
                setCurrentPageEnProceso(1);
              }}
              className={`bg-profile text-white text-center rounded-lg py-4 shadow-md hover:opacity-80 transition ${filtroContador === 'pendiente' ? 'ring-2 ring-white' : ''
                }`}
            >
              <div className="text-sm md:text-base">Enviadas, pendiente de pago: <strong>{getSolicitudesVisiblesPorRol().filter(s => s.status === 10).length}</strong></div>
            </button>

            <button
              onClick={() => {
                setFiltroContador('tramite');
                setCurrentPageEnProceso(1);
              }}
              className={`bg-profile text-white text-center rounded-lg py-4 shadow-md hover:opacity-80 transition ${filtroContador === 'tramite' ? 'ring-2 ring-white' : ''
                }`}
            >
              <div className="text-sm md:text-base">En trámite: <strong>{getSolicitudesVisiblesPorRol().filter(s => s.status === 30).length}</strong></div>
            </button>
          </div>

          {/* --- Table of "En Proceso" --- */}
          <TableWithRequests
            data={transformData(paginatedSolicitudesEnProceso)}
            rowsPerPage={rowsPerPage}
            title="Últimas Solicitudes"
            currentPage={currentPageEnProceso}
            totalPages={paginationEnProceso.totalPages}
            hasPrevPage={paginationEnProceso.hasPrevPage}
            hasNextPage={paginationEnProceso.hasNextPage}
            onPageChange={setCurrentPageEnProceso}
            extraHeader={deleteButtonHeader}
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
          />

          {/* --- Table of "Finalizadas" --- */}
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
