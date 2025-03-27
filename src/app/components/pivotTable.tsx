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
  months: { [key: string]: number };  // e.g. { "2024-05": 1, "2024-10": 8, ... }
}

const monthOrder = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const PivotTable: React.FC<PivotTableProps> = ({ months }) => {
  // Transform each "YYYY-MM" key into a data object
  const rawData = Object.keys(months).map(key => {
    // key looks like "2024-05"
    const [yearStr, monthStr] = key.split('-');
    const year = parseInt(yearStr, 10);
    const numericMonth = parseInt(monthStr, 10); // e.g. "05" => 5

    if (isNaN(year) || isNaN(numericMonth)) {
      console.warn(`PivotTable: invalid key "${key}" (expected "YYYY-MM")`);
      return null; // skip invalid
    }
    // Convert to zero-based index for our monthOrder array
    const zeroBased = numericMonth - 1; // e.g. 5 => 4 => "mayo" if january=0 => 'enero'
    if (zeroBased < 0 || zeroBased > 11) {
      console.warn(`PivotTable: month index out of range in "${key}"`);
      return null;
    }

    const monthName = monthOrder[zeroBased]; // e.g. "mayo"
    if (!monthName) {
      console.warn(`PivotTable: no month name for index=${zeroBased}`);
      return null;
    }

    const capitalizedName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return {
      year,
      month: monthName,
      // Keep numericMonth as the 1-based month, so we can sort easily
      // or you could store zeroBased if you prefer
      monthIndex: numericMonth,
      name: `${capitalizedName} ${year}`, // e.g. "Mayo 2024"
      solicitudes: months[key],           // The count from your data
    };
  }).filter(Boolean) as Array<{
    year: number;
    month: string;
    monthIndex: number;
    name: string;
    solicitudes: number;
  }>;

  // Sort by year, then by monthIndex
  const sortedData = rawData.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthIndex - b.monthIndex;
  });

  return (
    <div className="p-4 w-full">
      <h2 className="text-xl font-bold mb-4">
        Solicitudes Recibidas por Mes y Año
      </h2>
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
