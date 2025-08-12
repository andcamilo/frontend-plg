import React, { useEffect, useState } from 'react';
import HomeBox from '@components/homeBox';
import FormalitiesChart from '@components/formalitiesChart';
import TableWithPagination from '@components/TableWithPagination';
import DashboardCard from '@components/dashboardCard';
import PivotTable from '@components/pivotTable';
import { getRequests } from '@/src/app/dashboard/home/services/requests-by-email.service';
import { getRequestsCuenta } from '@/src/app/dashboard/home/services/request-cuenta.service';
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from "axios";
import get from 'lodash/get';
import { Rol } from '@constants/roles';

// Function to format date as dd/mm/yyyy
const formatDate = (timestamp?: { _seconds: number; _nanoseconds: number }): string => {
  if (!timestamp || typeof timestamp._seconds !== 'number') {
    console.error('Invalid or missing timestamp:', timestamp);
    return 'Invalid date'; // Return a fallback message if the timestamp is invalid
  }

  const date = new Date(timestamp._seconds * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};


const LegixStatistics: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [allSolicitudes, setAllSolicitudes] = useState<any[]>([]);
  const [tipoCounts, setTipoCounts] = useState<{ [key: string]: number }>({});
  const [statusCounts, setStatusCounts] = useState<{ status10: number; status20: number }>({
    status10: 0,
    status20: 0,
  });
  const [months, setMonths] = useState<{ [key: string]: number }>({});

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

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
  const handlePageChangeEnProceso = (newPage: number) => {
    if (newPage > 0 && newPage <= paginationEnProceso.totalPages) {
      setCurrentPageEnProceso(newPage);
    }
  };

  const handlePageChangeFinalizadas = (newPage: number) => {
    if (newPage > 0 && newPage <= paginationFinalizadas.totalPages) {
      setCurrentPageFinalizadas(newPage);
    }
  };

  interface FormData {
    email: string;
    cuenta: string;
    rol: string | number;
  }

  const [formData, setFormData] = useState<FormData>({
    email: "",
    cuenta: "",
    rol: 0,
  });

  const getSolicitudesFiltradasPorRol = (solicitudes: any[]) => {
    return solicitudes.filter((solicitud) => {
      const rol = formData.rol;
      const cuenta = formData.cuenta;

      const esCliente =
        (typeof rol === 'number' && rol < 20) ||
        rol === Rol.CLIENTE || rol === Rol.CLIENTE_RECURRENTE;

      const esAbogadoOAsistente =
        rol === Rol.ABOGADOS || rol === Rol.ASISTENTE || rol === 40 || rol === 35;

      if (esCliente) {
        return solicitud.cuenta === cuenta;
      }

      if (esAbogadoOAsistente) {
        const abogadoAsignado = (solicitud.abogados || []).some((abogado: any) =>
          abogado?.id === cuenta || abogado?._id === cuenta
        );
        return solicitud.cuenta === cuenta || abogadoAsignado;
      }

      // Otros roles (admin, etc.) ven todo
      return true;
    });
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = checkAuthToken();
    console.log("userData ", userData)
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        email: userData?.email,
        confirmEmail: userData?.email,
        cuenta: userData?.user_id,
      }));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (formData.cuenta) {
      const fetchUser = async () => {
        try {
          console.log("Cuenta ", formData.cuenta)
          const response = await axios.get('/api/get-user-cuenta', {
            params: { userCuenta: formData.cuenta },
          });

          const user = response.data;
          console.log("Usuario ", user)
          setFormData((prevData) => ({
            ...prevData,
            rol: get(user, 'solicitud.rol', 0)
          }));

        } catch (error) {
          console.error('Failed to fetch solicitudes:', error);
        }
      };

      fetchUser();
    }
  }, [formData.cuenta]);

  const [lastVisibleCursor, setLastVisibleCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchAllSolicitudes = async () => {
    try {

      if ((typeof formData.rol === 'number' && formData.rol < 20) ||
        (typeof formData.rol === 'string' && (formData.rol === Rol.CLIENTE || formData.rol === Rol.CLIENTE_RECURRENTE))) {

        const solicitudesData = await getRequestsCuenta(rowsPerPage, formData.cuenta, lastVisibleCursor);

        const {
          solicitudes = [],
          tipoCounts,
        } = solicitudesData;
        console.log("All Solicituds ", solicitudes)
        setAllSolicitudes(solicitudes);
        setTipoCounts(tipoCounts);

      } else {

        const userData = checkAuthToken();
        const solicitudesData = await getRequests(userData?.email, rowsPerPage, currentPage);


        const {
          allSolicitudes = [],
          tipoCounts,
          statusCounts,
          months
        } = solicitudesData;

        setAllSolicitudes(allSolicitudes);
        setTipoCounts(tipoCounts);
        setStatusCounts(statusCounts);
        setMonths(months);
      }

    } catch (error) {
      console.error('Failed to fetch all solicitudes:', error);
    }
  };

  const fetchPaginatedSolicitudes = async (reset = false) => {
    try {
      let solicitudesData;

      if (
        (typeof formData.rol === 'number' && formData.rol < 20) ||
        (typeof formData.rol === 'string' && (formData.rol === Rol.CLIENTE || formData.rol === Rol.CLIENTE_RECURRENTE))
      ) {
        solicitudesData = await getRequestsCuenta(rowsPerPage, formData.cuenta, lastVisibleCursor);
      } else {
        const userData = checkAuthToken();
        solicitudesData = await getRequests(userData?.email, rowsPerPage, currentPage)

      }

      const { solicitudes, pagination } = solicitudesData;

      setSolicitudes(solicitudes);
      setLastVisibleCursor(pagination.nextCursor || null);
      setHasNextPage(pagination.hasNextPage);

    } catch (error) {
      console.error('Failed to fetch paginated solicitudes:', error);
    }
  };

  useEffect(() => {
    if (formData.cuenta && formData.rol !== 0) {
      console.log("✔️ Rol y cuenta listos:", formData.rol, formData.cuenta);
      fetchAllSolicitudes();
      fetchPaginatedSolicitudes(true);
    }
  }, [formData.cuenta, formData.rol]);

  useEffect(() => {
    if (currentPage > 1 && hasNextPage) {
      fetchPaginatedSolicitudes();
    }
  }, [currentPage]);

  const tipoMapping: { [key: string]: string } = {
    "propuesta-legal": "Propuesta Legal",
    "consulta-legal": "Propuesta Legal",
    "consulta-escrita": "Consulta Escrita",
    "consulta-virtual": "Consulta Virtual",
    "consulta-presencial": "Consulta Presencial",
    "new-fundacion": "Fundación de Interés Privado",
    "new-sociedad-empresa": "Sociedad / Empresa",
    "menores-al-extranjero": "Salida de Menores al Extranjero",
    "pension-alimenticia": "Pensión Alimenticia",
    "pension": "Pensión Alimenticia",
    "tramite-general": "Trámite General",
    "pension-desacato": "Pensión Desacato",
    "solicitud-cliente-recurrente": "Solicitud Cliente Recurrente",
  };

  const statusMapping: { [key: number]: string } = {
    0: "Rechazada",
    1: "Borrador",
    10: "Pendiente de pago",
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

  const solicitudesFiltradas = getSolicitudesFiltradasPorRol(allSolicitudes);
  const solicitudFinalizada = solicitudesFiltradas.filter(
    (solicitud) => parseInt(solicitud.status) === 70
  ).length;

  const solicitudEnProceso = solicitudesFiltradas.filter(
    (solicitud) => {
      const status = parseInt(solicitud.status);
      return status !== 70 && status !== 1; 
    }
  ).length;

  const solicitudesFinalizadas = getSolicitudesFiltradasPorRol(allSolicitudes)
    .filter((solicitud) => parseInt(solicitud.status) === 70)
    .map(({ tipo, emailSolicita, date, status }) => ({
      Tipo: tipoMapping[tipo] || tipo,
      Fecha: formatDate(date),
      Email: emailSolicita,
      Estatus: (
        <span className={`status-badge ${statusClasses[status]}`}>
          {statusMapping[status]}
        </span>
      ),
    }));

  const solicitudesEnProceso = getSolicitudesFiltradasPorRol(allSolicitudes)
    .filter((solicitud) => parseInt(solicitud.status) !== 70)
    .map(({ tipo, emailSolicita, date, status }) => ({
      Tipo: tipoMapping[tipo] || tipo,
      Fecha: formatDate(date),
      Email: emailSolicita,
      Estatus: (
        <span className={`status-badge ${statusClasses[status]}`}>
          {statusMapping[status]}
        </span>
      ),
    }));

  const tipoCountsFiltrados: { [key: string]: number } = {};
  solicitudesFiltradas.forEach((solicitud) => {
    tipoCountsFiltrados[solicitud.tipo] = (tipoCountsFiltrados[solicitud.tipo] || 0) + 1;
  });

  // Paginación de solicitudes finalizadas
  const paginatedSolicitudesEnProceso = solicitudesEnProceso.slice(
    (currentPageEnProceso - 1) * rowsPerPage,
    currentPageEnProceso * rowsPerPage
  );

  // Paginación de solicitudes finalizadas
  const paginatedSolicitudesFinalizadas = solicitudesFinalizadas.slice(
    (currentPageFinalizadas - 1) * rowsPerPage,
    currentPageFinalizadas * rowsPerPage
  );

  // Calcular el número de páginas
  useEffect(() => {
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
  }, [
    solicitudesEnProceso.length,
    solicitudesFinalizadas.length,
    currentPageEnProceso,
    currentPageFinalizadas,
    rowsPerPage
  ]);


  useEffect(() => {
    if (formData.cuenta) {
      fetchPaginatedSolicitudes(true);
    }
  }, [currentPage]);

  useEffect(() => {
    console.log("🚀 ~ tipoCounts:", tipoCounts)
  }, [tipoCounts]);


  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[97%]">
        <HomeBox title="Sociedades" number={tipoCountsFiltrados['new-sociedad-empresa'] || 0} color="bg-[#9694FF]" />
        <HomeBox
          title="Fundaciones"
          number={(tipoCountsFiltrados['new-fundacion'] || 0)}
          color="bg-[#57caeb]"
        />
        <HomeBox
          title="Propuesta Legal"
          number={(tipoCountsFiltrados['Propuesta-Legal'] || 0) + (tipoCountsFiltrados['consulta-legal'] || 0) + (tipoCountsFiltrados['propuesta-legal'] || 0)}
          color="bg-[#5ddab4]"
        />
        <HomeBox title="Consulta Escrita" number={(tipoCountsFiltrados['Consulta-Escrita'] || 0) + (tipoCountsFiltrados['consulta-escrita'] || 0)} color="bg-[#ff7976]" />
        <HomeBox title="Consulta Virtual" number={(tipoCountsFiltrados['Consulta-Virtual'] || 0) + (tipoCountsFiltrados['consulta-virtual'] || 0)} color="bg-black" />
        <HomeBox title="Consulta Presencial" number={(tipoCountsFiltrados['Consulta-Presencial'] || 0) + (tipoCountsFiltrados['consulta-presencial'] || 0)} color="bg-[#f4a261]" />
        <HomeBox title="Tramite General" number={tipoCountsFiltrados['tramite-general'] || 0} color="bg-[#e76f51]" />
        <HomeBox title="Pensiones" number={(tipoCountsFiltrados['pension-alimenticia'] || 0) + (tipoCountsFiltrados['pension'] || 0)} color="bg-[#2a9d8f]" />
        <HomeBox title="Pension Desacato" number={tipoCountsFiltrados['pension-desacato'] || 0} color="bg-[#264653]" />
        <HomeBox title="Salida de Menores al Extranjero" number={tipoCountsFiltrados['menores-al-extranjero'] || 0} color="bg-[#e9c46a]" />
        <HomeBox title="Cliente Recurrente" number={tipoCountsFiltrados['solicitud-cliente-recurrente'] || 0} color="bg-[#264653]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2">
          <TableWithPagination
            data={paginatedSolicitudesEnProceso}
            rowsPerPage={rowsPerPage}
            title="Últimas solicitudes"
            currentPage={currentPageEnProceso}
            totalPages={paginationEnProceso.totalPages}
            hasPrevPage={paginationEnProceso.hasPrevPage}
            hasNextPage={paginationEnProceso.hasNextPage}
            onPageChange={handlePageChangeEnProceso}
          />

          <TableWithPagination
            data={paginatedSolicitudesFinalizadas}
            rowsPerPage={rowsPerPage}
            title="Solicitudes finalizadas"
            currentPage={currentPageFinalizadas}
            totalPages={paginationFinalizadas.totalPages}
            hasPrevPage={paginationFinalizadas.hasPrevPage}
            hasNextPage={paginationFinalizadas.hasNextPage}
            onPageChange={handlePageChangeFinalizadas}
          />

          {!(
            (typeof formData.rol === 'number' && formData.rol < 50) ||
            (typeof formData.rol === 'string' && formData.rol === Rol.CLIENTE) ||
            (typeof formData.rol === 'string' && formData.rol === Rol.CLIENTE_RECURRENTE)
          ) && <PivotTable months={months} />}

        </div>
        <div className="lg:col-span-1">
          {!(
            (typeof formData.rol === 'number' && formData.rol < 50) ||
            (typeof formData.rol === 'string' && formData.rol === Rol.CLIENTE) ||
            (typeof formData.rol === 'string' && formData.rol === Rol.CLIENTE_RECURRENTE)
          ) &&
            <>
              <DashboardCard title={"Solicitudes pendientes de pago"} value={statusCounts.status10} />
              <DashboardCard title={"Solicitudes pagadas"} value={statusCounts.status20} />
              <DashboardCard title={"Balance de ingresos"} value={0.0} />
            </>
          }
          <FormalitiesChart
            solicitudFinalizada={solicitudFinalizada}
            solicitudEnProceso={solicitudEnProceso}
          />
        </div>
      </div>
    </div>
  );
};

export default LegixStatistics;
