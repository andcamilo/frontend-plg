"use client";
import React, { useEffect, useState } from "react";
import HomeBox from "@components/homeBox";
import FormalitiesChart from "@components/formalitiesChart";
import TableWithPagination from "@components/TableWithPagination";
import DashboardCard from "@components/dashboardCard";
import PivotTable from "@components/pivotTable";
import { checkAuthToken } from "@utils/checkAuthToken";
import { solicitudFinalizada } from "../utils/solicitud-finalizada.util";
import { solicitudEnProceso } from "../utils/solicitud-en-proceso.util";
import { solicitudesEnProceso } from "../utils/solicitudes-en-proceso.util";
import { paginatedSolicitudesEnProceso } from "../utils/solicitudes-en-proceso-paginated.util";
import { solicitudesFinalizadas } from "../utils/solicitudes-finalizadas.util";
import { paginatedSolicitudesFinalizadas } from "../utils/solicitudes-finalizadas-paginated.util";
import { tipoCountsFiltradosUtil } from "../utils/tipo-counts-filtrados.util";

const LegixStatistics: React.FC<{
  rol: number;
  pagination: any;
  allSolicitudes: any[];
  statusCounts: any;
  months: any;
}> = ({ rol, pagination, allSolicitudes, statusCounts, months }) => {
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

  const userData = checkAuthToken();

  const formData = {
    email: userData?.email || "",
    cuenta: userData?.user_id || "",
    rol: rol,
  };
  const tipoCountsFiltrados = tipoCountsFiltradosUtil(allSolicitudes, formData);

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
            data={paginatedSolicitudesEnProceso(
              allSolicitudes,
              formData,
              currentPageEnProceso,
              rowsPerPage
            )}
            rowsPerPage={rowsPerPage}
            title="Últimas solicitudes"
            currentPage={currentPageEnProceso}
            totalPages={paginationEnProceso.totalPages}
            hasPrevPage={paginationEnProceso.hasPrevPage}
            hasNextPage={paginationEnProceso.hasNextPage}
            onPageChange={handlePageChangeEnProceso}
          />

          <TableWithPagination
            data={paginatedSolicitudesFinalizadas(
              allSolicitudes,
              formData,
              currentPageFinalizadas,
              rowsPerPage
            )}
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
