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
  // Transform the months data into an array suitable for Recharts
  const data = Object.keys(months).map((month) => ({
    name: month.charAt(0).toUpperCase() + month.slice(1),
    solicitudes: months[month],
  }));

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">Solicitudes Recibidas por Mes</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="solicitudes" fill="#8884d8" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PivotTable;
