"use client";
import React, { useEffect, useState } from "react";
import HomeBox from "@components/homeBox";
import FormalitiesChart from "@components/formalitiesChart";
import TableWithPagination from "@components/TableWithPagination";
import DashboardCard from "@components/dashboardCard";
import PivotTable from "@components/pivotTable";
import { getRequests } from "@api/request";
import { getRequestsCuenta } from "@/src/app/dashboard/home/services/request-cuenta.service";
import { checkAuthToken } from "@utils/checkAuthToken";
import { formatDate } from "../utils/format-date.util";
import { CURRENT_PAGE } from "../constants/current-page.constant";
import { fetchUser } from "../services/request-user-cuenta.service";
import { TIPO_MAPPING } from "../constants/tipo-mapping.constant";
import { STATUS_MAPPING } from "../constants/status-mapping.constant";
import { STATUS_CLASSES } from "../constants/status-classes.constant";
import { getSolicitudesFiltradasPorRol } from "../utils/solicitudes-filtradas-por-rol.util";
import { FormData } from "../types/form-data.types";
import { solicitudesFiltradas } from "../utils/solicitudes-filtradas.util";
import { solicitudFinalizada } from "../utils/solicitud-finalizada.util";
import { solicitudEnProceso } from "../utils/solicitud-en-proceso.util";
import { solicitudesEnProceso } from "../utils/solicitudes-en-proceso.util";

const LegixStatistics: React.FC = () => {
  const [allSolicitudes, setAllSolicitudes] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<{
    status10: number;
    status20: number;
  }>({
    status10: 0,
    status20: 0,
  });
  const [months, setMonths] = useState<{ [key: string]: number }>({});

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

  const [formData, setFormData] = useState<FormData>({
    email: "",
    cuenta: "",
    rol: 0,
  });

  useEffect(() => {
    const userData = checkAuthToken();
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        email: userData?.email,
        confirmEmail: userData?.email,
        cuenta: userData?.user_id,
      }));
    }
  }, []);

  useEffect(() => {
    if (formData.cuenta) {
      const getUser = async () => {
        const user = await fetchUser(formData.cuenta);
        setFormData((prevData) => ({
          ...prevData,
          rol: user.rol,
        }));
      };

      getUser();
    }
  }, [formData.cuenta]);

  const [lastVisibleCursor, setLastVisibleCursor] = useState<string | null>(
    null
  );
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchAllSolicitudes = async () => {
    try {
      if (
        (typeof formData.rol === "number" && formData.rol < 20) ||
        (typeof formData.rol === "string" &&
          (formData.rol === "Cliente" || formData.rol === "Cliente recurrente"))
      ) {
        const solicitudesData = await getRequestsCuenta(
          rowsPerPage,
          formData.cuenta,
          lastVisibleCursor
        );

        const { solicitudes = [] } = solicitudesData;
        console.log("All Solicituds ", solicitudes);
        setAllSolicitudes(solicitudes);
      } else {
        const userData = checkAuthToken();
        const solicitudesData = await getRequests(
          userData?.email,
          rowsPerPage,
          CURRENT_PAGE
        );

        const { allSolicitudes = [], statusCounts, months } = solicitudesData;

        setAllSolicitudes(allSolicitudes);
        setStatusCounts(statusCounts);
        setMonths(months);
      }
    } catch (error) {
      console.error("Failed to fetch all solicitudes:", error);
    }
  };

  const fetchPaginatedSolicitudes = async (reset = false) => {
    try {
      let solicitudesData;

      if (
        (typeof formData.rol === "number" && formData.rol < 20) ||
        (typeof formData.rol === "string" &&
          (formData.rol === "Cliente" || formData.rol === "Cliente recurrente"))
      ) {
        solicitudesData = await getRequestsCuenta(
          rowsPerPage,
          formData.cuenta,
          lastVisibleCursor
        );
      } else {
        const userData = checkAuthToken();
        solicitudesData = await getRequests(
          userData?.email,
          rowsPerPage,
          CURRENT_PAGE
        );
      }

      const { pagination } = solicitudesData;

      setLastVisibleCursor(pagination.nextCursor || null);
      setHasNextPage(pagination.hasNextPage);
    } catch (error) {
      console.error("Failed to fetch paginated solicitudes:", error);
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
    if (CURRENT_PAGE > 1 && hasNextPage) {
      fetchPaginatedSolicitudes();
    }
  }, [CURRENT_PAGE]);

  const solicitudesFinalizadas = getSolicitudesFiltradasPorRol(
    allSolicitudes,
    formData
  )
    .filter((solicitud) => parseInt(solicitud.status) === 70)
    .map(({ tipo, emailSolicita, date, status }) => ({
      Tipo: TIPO_MAPPING[tipo] || tipo,
      Fecha: formatDate(date),
      Email: emailSolicita,
      Estatus: (
        <span className={`status-badge ${STATUS_CLASSES[status]}`}>
          {STATUS_MAPPING[status]}
        </span>
      ),
    }));

  const tipoCountsFiltrados: { [key: string]: number } = {};
  solicitudesFiltradas(allSolicitudes, formData).forEach((solicitud) => {
    tipoCountsFiltrados[solicitud.tipo] =
      (tipoCountsFiltrados[solicitud.tipo] || 0) + 1;
  });

  // Paginación de solicitudes finalizadas
  const paginatedSolicitudesEnProceso = solicitudesEnProceso(
    allSolicitudes,
    formData
  ).slice(
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
      hasNextPage:
        currentPageEnProceso <
        Math.ceil(solicitudesEnProceso.length / rowsPerPage),
      totalPages: Math.ceil(solicitudesEnProceso.length / rowsPerPage),
    });

    setPaginationFinalizadas({
      hasPrevPage: currentPageFinalizadas > 1,
      hasNextPage:
        currentPageFinalizadas <
        Math.ceil(solicitudesFinalizadas.length / rowsPerPage),
      totalPages: Math.ceil(solicitudesFinalizadas.length / rowsPerPage),
    });
  }, [
    solicitudesEnProceso.length,
    solicitudesFinalizadas.length,
    currentPageEnProceso,
    currentPageFinalizadas,
    rowsPerPage,
  ]);

  useEffect(() => {
    if (formData.cuenta) {
      fetchPaginatedSolicitudes(true);
    }
  }, [CURRENT_PAGE]);

  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[97%]">
        <HomeBox
          title="Sociedades"
          number={tipoCountsFiltrados["new-sociedad-empresa"] || 0}
          color="bg-[#9694FF]"
        />
        <HomeBox
          title="Fundaciones"
          number={
            (tipoCountsFiltrados["new-fundacion-interes-privado"] || 0) +
            (tipoCountsFiltrados["new-fundacion"] || 0)
          }
          color="bg-[#57caeb]"
        />
        <HomeBox
          title="Propuesta Legal"
          number={
            (tipoCountsFiltrados["Propuesta-Legal"] || 0) +
            (tipoCountsFiltrados["consulta-legal"] || 0) +
            (tipoCountsFiltrados["propuesta-legal"] || 0)
          }
          color="bg-[#5ddab4]"
        />
        <HomeBox
          title="Consulta Escrita"
          number={
            (tipoCountsFiltrados["Consulta-Escrita"] || 0) +
            (tipoCountsFiltrados["consulta-escrita"] || 0)
          }
          color="bg-[#ff7976]"
        />
        <HomeBox
          title="Consulta Virtual"
          number={
            (tipoCountsFiltrados["Consulta-Virtual"] || 0) +
            (tipoCountsFiltrados["consulta-virtual"] || 0)
          }
          color="bg-black"
        />
        <HomeBox
          title="Consulta Presencial"
          number={
            (tipoCountsFiltrados["Consulta-Presencial"] || 0) +
            (tipoCountsFiltrados["consulta-presencial"] || 0)
          }
          color="bg-[#f4a261]"
        />
        <HomeBox
          title="Tramite General"
          number={tipoCountsFiltrados["tramite-general"] || 0}
          color="bg-[#e76f51]"
        />
        <HomeBox
          title="Pensiones"
          number={
            (tipoCountsFiltrados["pension-alimenticia"] || 0) +
            (tipoCountsFiltrados["pension"] || 0)
          }
          color="bg-[#2a9d8f]"
        />
        <HomeBox
          title="Pension Desacato"
          number={tipoCountsFiltrados["pension-desacato"] || 0}
          color="bg-[#264653]"
        />
        <HomeBox
          title="Salida de Menores al Extranjero"
          number={tipoCountsFiltrados["menores-al-extranjero"] || 0}
          color="bg-[#e9c46a]"
        />
        <HomeBox
          title="Cliente Recurrente"
          number={tipoCountsFiltrados["solicitud-cliente-recurrente"] || 0}
          color="bg-[#264653]"
        />
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
            (typeof formData.rol === "number" && formData.rol < 50) ||
            (typeof formData.rol === "string" && formData.rol === "Cliente") ||
            (typeof formData.rol === "string" &&
              formData.rol === "Cliente recurrente")
          ) && <PivotTable months={months} />}
        </div>
        <div className="lg:col-span-1">
          {!(
            (typeof formData.rol === "number" && formData.rol < 50) ||
            (typeof formData.rol === "string" && formData.rol === "Cliente") ||
            (typeof formData.rol === "string" &&
              formData.rol === "Cliente recurrente")
          ) && (
            <>
              <DashboardCard
                title={"Solicitudes pendientes de pago"}
                value={statusCounts.status10}
              />
              <DashboardCard
                title={"Solicitudes pagadas"}
                value={statusCounts.status20}
              />
              <DashboardCard title={"Balance de ingresos"} value={0.0} />
            </>
          )}
          <FormalitiesChart
            solicitudFinalizada={solicitudFinalizada(allSolicitudes, formData)}
            solicitudEnProceso={solicitudEnProceso(allSolicitudes, formData)}
          />
        </div>
      </div>
    </div>
  );
};

export default LegixStatistics;
