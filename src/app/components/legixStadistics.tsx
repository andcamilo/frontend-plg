import React from 'react';
import HomeBox from '@/app/components/homeBox';
import FormalitiesChart from './formalitiesChart';
import TableWithPagination from './TableWithPagination';

const data = [
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada' },
];

const LegixStatistics: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[80%]">
        <HomeBox title="Solicitudes" number={1} color="bg-[#9694FF]" />
        <HomeBox title="Sociedades" number={5} color="bg-[#57caeb]" />
        <HomeBox title="Fundaciones" number={100} color="bg-[#5ddab4]" />
        <HomeBox title="Pensiones" number={20} color="bg-[#ff7976]" />
        <HomeBox title="Otros" number={0} color="bg-black" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">

        <div className="lg:col-span-2">
          <TableWithPagination data={data} rowsPerPage={3} title="Últimas solicitudes" />
          <TableWithPagination data={data} rowsPerPage={3} title="Solicitudes finalizadas" />
        </div>
        <div className="lg:col-span-1">
          <FormalitiesChart />
        </div>

      </div>
    </div>
  );
};

export default LegixStatistics;
