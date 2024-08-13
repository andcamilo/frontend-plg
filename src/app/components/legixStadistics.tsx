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

const dataSolicitudes = [
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0001', lawyer: 'Maria', action: '' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0002', lawyer: 'Camilo', action: '' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0003', lawyer: 'Maria', action: '' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0004', lawyer: 'Chris', action: '' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0005', lawyer: 'Camilo', action: '' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0006', lawyer: 'Chris', action: '' },
  { type: 'Propuesta Legal', email: '18test@example.us', date: '31-07-2024', status: 'Pagada', id: '2024-0007', lawyer: 'Maria', action: '' },
];

const LegixStatistics: React.FC<{ showContent: boolean }> = ({ showContent }) => {
  const currentData = showContent ? data : dataSolicitudes;

  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      {showContent && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[80%]">
            <HomeBox title="Solicitudes" number={1} color="bg-[#9694FF]" />
            <HomeBox title="Sociedades" number={5} color="bg-[#57caeb]" />
            <HomeBox title="Fundaciones" number={100} color="bg-[#5ddab4]" />
            <HomeBox title="Pensiones" number={20} color="bg-[#ff7976]" />
            <HomeBox title="Otros" number={0} color="bg-black" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
            <div className="lg:col-span-2">
              <TableWithPagination data={currentData} rowsPerPage={3} title="Últimas solicitudes" isSolicitudes={!showContent} />
              <TableWithPagination data={currentData} rowsPerPage={3} title="Solicitudes finalizadas" isSolicitudes={!showContent} />
            </div>
            <div className="lg:col-span-1">
              <FormalitiesChart />
            </div>
          </div>
        </>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-3">
          <TableWithPagination data={currentData} rowsPerPage={3} title="Últimas solicitudes" isSolicitudes={!showContent} />
          <TableWithPagination data={currentData} rowsPerPage={3} title="Solicitudes finalizadas" isSolicitudes={!showContent} />
        </div>
      </div>

    </div>
  );
};

export default LegixStatistics;
