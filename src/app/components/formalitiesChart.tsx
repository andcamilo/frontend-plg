import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend);

interface FormalitiesChartProps {
  solicitudFinalizada: number;
  solicitudEnProceso: number;
}

const FormalitiesChart: React.FC<FormalitiesChartProps> = ({ solicitudFinalizada, solicitudEnProceso }) => {
  const data = {
    labels: ['En proceso', 'Finalizadas'],
    datasets: [
      {
        data: [solicitudEnProceso, solicitudFinalizada], // Actualización de los datos
        backgroundColor: [' #9b1b77', '#57caeb'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const, // Correct type inference
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          color: '#9CA3AF',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} solicitudes`; // Mostrar la cantidad real
          },
        },
      },
    },
  };

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-sm flex flex-col items-center">
      <h2 className="text-lg font-bold text-white mb-4">Trámites realizados</h2>
      <div className="w-full h-64">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default FormalitiesChart;
