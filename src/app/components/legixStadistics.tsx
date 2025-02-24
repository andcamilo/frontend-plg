import React, { useEffect, useState } from 'react';
import HomeBox from '@components/homeBox';
import FormalitiesChart from '@components/formalitiesChart';
import TableWithPagination from '@components/TableWithPagination';
import DashboardCard from '@components/dashboardCard';
import PivotTable from '@components/pivotTable';
import { getRequests } from '@api/request';
import { getRequestsCuenta } from '@api/request-cuenta';
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from "axios";
import get from 'lodash/get';

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
  const [tipoCounts, setTipoCounts] = useState<{ [key: string]: number }>({});
  const [statusCounts, setStatusCounts] = useState<{ status10: number; status20: number }>({
    status10: 0,
    status20: 0,
  });
  const [months, setMonths] = useState<{ [key: string]: number }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(3);
  const [pagination, setPagination] = useState({
    hasPrevPage: false,
    hasNextPage: false,
    totalPages: 1,
  });

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

  const [lastVisibleCursor, setLastVisibleCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchSolicitudes = async (reset = false) => {
    try {
      let solicitudesData;

      if (
        (typeof formData.rol === 'number' && formData.rol < 20) ||
        (typeof formData.rol === 'string' && formData.rol === 'Cliente') ||
        (typeof formData.rol === 'string' && formData.rol === 'Cliente recurrente')
      ) {
        // Llamada específica si el rol es restringido
        solicitudesData = await getRequestsCuenta(rowsPerPage, formData.cuenta, lastVisibleCursor);
      } else {
        // Llamada general para otros roles
        solicitudesData = await getRequests(rowsPerPage, currentPage);
      }

      const { solicitudes, pagination, tipoCounts, statusCounts, months } = solicitudesData;

      // 🔄 Si es un reinicio de la paginación, reemplaza las solicitudes
      setSolicitudes((prev) => (reset ? solicitudes : [...prev, ...solicitudes]));
      setTipoCounts(tipoCounts);
      setStatusCounts(statusCounts);
      setMonths(months);

      // 🔄 Actualiza el cursor para la próxima página
      setLastVisibleCursor(pagination.nextCursor || null);
      setHasNextPage(pagination.hasNextPage);
    } catch (error) {
      console.error('Failed to fetch solicitudes:', error);
    }
  };

  useEffect(() => {
    if (formData.cuenta) {
      console.log("✔️ Cuenta actualizada correctamente:", formData.cuenta);

      // Reinicia los datos de la paginación
      setLastVisibleCursor(null);
      setSolicitudes([]);
      fetchSolicitudes(true);
    }
  }, [formData.cuenta, formData.rol]);

  useEffect(() => {
    if (currentPage > 1 && hasNextPage) {
      fetchSolicitudes();
    }
  }, [currentPage]);

  const tipoMapping: { [key: string]: string } = {
    "propuesta-legal": "Propuesta Legal",
    "consulta-escrita": "Consulta Escrita",
    "consulta-virtual": "Consulta Virtual",
    "consulta-presencial": "Consulta Presencial",
    "new-fundacion-interes-privado": "Fundación de Interés Privado",
    "new-sociedad-empresa": "Sociedad / Empresa",
    "menores-al-extranjero": "Salida de Menores al Extranjero",
    "pension-alimenticia": "Pensión Alimenticia",
    "tramite-general": "Trámite General",
    "pension-desacato": "Pensión Desacato",
  };

  const statusMapping: { [key: number]: string } = {
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

  // Transform data to include only the required attributes and format the date
  const transformedSolicitudes = solicitudes.map(({ tipo, emailSolicita, date, status }) => ({
    Tipo: tipoMapping[tipo] || tipo,
    Fecha: formatDate(date),
    Email: emailSolicita,
    Estatus: (
      <span className={`status-badge ${statusClasses[status]}`}>
        {statusMapping[status]}
      </span>
    ),
  }));

  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[80%]">
        <HomeBox title="Sociedades" number={tipoCounts['new-sociedad-empresa'] || 0} color="bg-[#9694FF]" />
        <HomeBox title="Fundaciones" number={tipoCounts['new-fundacion-interes-privado'] || 0} color="bg-[#57caeb]" />
        <HomeBox title="Propuesta Legal" number={tipoCounts['Propuesta-Legal'] || 0} color="bg-[#5ddab4]" />
        <HomeBox title="Consulta Escrita" number={tipoCounts['Consulta-Escrita'] || 0} color="bg-[#ff7976]" />
        <HomeBox title="Consulta Virtual" number={tipoCounts['Consulta-Virtual'] || 0} color="bg-black" />
        <HomeBox title="Consulta Presencial" number={tipoCounts['Consulta-Presencial'] || 0} color="bg-[#f4a261]" />
        <HomeBox title="Tramite General" number={tipoCounts['Tramite General'] || 0} color="bg-[#e76f51]" />
        <HomeBox title="Pensiones" number={tipoCounts['pension-alimenticia'] || 0} color="bg-[#2a9d8f]" />
        <HomeBox title="Pension Desacato" number={tipoCounts['pension-desacato'] || 0} color="bg-[#264653]" />
        <HomeBox title="Salida de Menores al Extranjero" number={tipoCounts['salida-menores-al-extranjero'] || 0} color="bg-[#e9c46a]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2">
          <TableWithPagination
            data={transformedSolicitudes}
            rowsPerPage={rowsPerPage}
            title="Últimas solicitudes"
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            hasPrevPage={pagination.hasPrevPage}
            hasNextPage={hasNextPage}
            onPageChange={() => {
              if (hasNextPage) {
                setCurrentPage((prevPage) => prevPage + 1);
              }
            }}
          />
          <PivotTable months={months} />
        </div>
        <div className="lg:col-span-1">
          <DashboardCard title={"Solicitudes pendientes de pago"} value={statusCounts.status10} />
          <DashboardCard title={"Solicitudes pagadas"} value={statusCounts.status20} />
          <DashboardCard title={"Balance de ingresos"} value={0.0} />
          <FormalitiesChart />
        </div>
      </div>
    </div>
  );
};

export default LegixStatistics;
