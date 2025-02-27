import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PivotTableProps {
  months: { [key: string]: number };
}

const PivotTable: React.FC<PivotTableProps> = ({ months }) => {
  const monthOrder = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // Transformar los datos a un formato adecuado
  const data = Object.keys(months).map((key) => {
    const [year, monthIndex] = key.split('-'); // Ejemplo de key: "2024-03"
    const monthName = monthOrder[parseInt(monthIndex) - 1]; // Convertir índice a nombre de mes en español
    return {
      year: parseInt(year),
      month: monthName,
      monthIndex: parseInt(monthIndex),
      name: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
      solicitudes: months[key],
    };
  });

  // Ordenar por año y mes
  const sortedData = data.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthIndex - b.monthIndex;
  });

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Solicitudes Recibidas por Mes y Año</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="solicitudes" fill="#9b1b77" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PivotTable;
