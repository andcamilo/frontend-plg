import React, { useEffect, useState }  from 'react';
import HomeBox from '@components/homeBox';
import FormalitiesChart from '@components/formalitiesChart';
import TableWithPagination from '@components/TableWithPagination';
import DashboardCard from '@components/dashboardCard';
import { getRequests } from '@api/request';

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

  const [solicitudes, setSolicitudes] = useState<any[]>([]); 
  const [paymentPeding, setPaymentPeding] = useState<number>(0); 
  const [paymentPaid, setPaymentPaid] = useState<number>(0); 


  const calculatePendingPayments = async () => {
    
    const pendingCount = solicitudes
      .filter((solicitud) => {
        return solicitud.status === 10;
      })
      .length; 
    
    
    setPaymentPeding(pendingCount);
  };
  
  

  const calculatePaidPayments = async () => {
    const paidCount = solicitudes
      .filter((solicitud) => solicitud.status === 20)
      .length; 
  
    setPaymentPaid(paidCount);
  };
  

  useEffect(() => {
    const fetchSolicitudes = async () => {
      try {
        const data = await getRequests(); 
        console.log('Fetched solicitudes:', data[0].status);
        setSolicitudes(data); 

        calculatePaidPayments()
        
      } catch (error) {
        console.error('Failed to fetch solicitudes:', error);
      }
    };

    fetchSolicitudes();
  }, []);


  useEffect(() => {
    calculatePaidPayments();
    calculatePendingPayments();
  }, [solicitudes]);


  return (
    <div className="flex flex-col gap-4 p-8 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 w-[80%]">
        <HomeBox title="Solicitudes" number={solicitudes.length} color="bg-[#9694FF]" />
        <HomeBox title="Sociedades" number={0} color="bg-[#57caeb]" />
        <HomeBox title="Fundaciones" number={0} color="bg-[#5ddab4]" />
        <HomeBox title="Pensiones" number={0} color="bg-[#ff7976]" />
        <HomeBox title="Otros" number={solicitudes.length} color="bg-black" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">

        <div className="lg:col-span-2">
          <TableWithPagination data={data} rowsPerPage={3} title="Últimas solicitudes" />
          <TableWithPagination data={data} rowsPerPage={3} title="Solicitudes finalizadas" />
        </div>
        <div className="lg:col-span-1">
          <DashboardCard title={"Solicitudes pendientes de pago"} value={paymentPeding} />
          <DashboardCard title={"Solicitudes pagadas"} value={paymentPaid} />
          <DashboardCard title={"Balance de ingresos"} value={0.0} />
          <FormalitiesChart />
        </div>

      </div>
    </div>
  );
};

export default LegixStatistics;
