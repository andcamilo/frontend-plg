import React, { useEffect, useState } from 'react';
import HomeBox from '@components/homeBox';
import FormalitiesChart from '@components/formalitiesChart';
import TableWithPagination from '@components/TableWithPagination';
import DashboardCard from '@components/dashboardCard';
import PivotTable from '@components/pivotTable';
/* import { getRequests } from '@api/request'; */

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

  useEffect(() => {
    const fetchSolicitudes = async () => {
      /* try {
        const { solicitudes, pagination, tipoCounts, statusCounts, months } = await getRequests(rowsPerPage, currentPage);
        setSolicitudes(solicitudes);
        setTipoCounts(tipoCounts);
        setStatusCounts(statusCounts);
        setMonths(months); // Save the months data in the state
        setPagination({
          hasPrevPage: pagination.hasPrevPage,
          hasNextPage: pagination.hasNextPage,
          totalPages: pagination.totalPages,
        });

        // Print the months object
        console.log('Months:', months);

      } catch (error) {
        console.error('Failed to fetch solicitudes:', error);
      } */
    };

    fetchSolicitudes();
  }, [currentPage, rowsPerPage]);

  // Transform data to include only the required attributes and format the date
  const transformedSolicitudes = solicitudes.map(({ tipo, emailSolicita, date, status }) => ({
    Tipo: tipo,
    Fecha: formatDate(date), 
    Email: emailSolicita,
    Estatus: status,
  }));

  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[80%]">
        <HomeBox title="new-sociedad-empresa" number={tipoCounts['new-sociedad-empresa'] || 0} color="bg-[#9694FF]" />
        <HomeBox title="new-fundacion-interes-privado" number={tipoCounts['new-fundacion-interes-privado'] || 0} color="bg-[#57caeb]" />
        <HomeBox title="Propuesta-Legal" number={tipoCounts['Propuesta-Legal'] || 0} color="bg-[#5ddab4]" />
        <HomeBox title="Consulta-Escrita" number={tipoCounts['Consulta-Escrita'] || 0} color="bg-[#ff7976]" />
        <HomeBox title="Consulta-Virtual" number={tipoCounts['Consulta-Virtual'] || 0} color="bg-black" />
        <HomeBox title="Consulta-Presencial" number={tipoCounts['Consulta-Presencial'] || 0} color="bg-[#f4a261]" />
        <HomeBox title="Tramite General" number={tipoCounts['Tramite General'] || 0} color="bg-[#e76f51]" />
        <HomeBox title="pension-alimenticia" number={tipoCounts['pension-alimenticia'] || 0} color="bg-[#2a9d8f]" />
        <HomeBox title="pension-desacato" number={tipoCounts['pension-desacato'] || 0} color="bg-[#264653]" />
        <HomeBox title="salida-menores-al-extranjero" number={tipoCounts['salida-menores-al-extranjero'] || 0} color="bg-[#e9c46a]" />
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
            hasNextPage={pagination.hasNextPage}
            onPageChange={setCurrentPage}
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
