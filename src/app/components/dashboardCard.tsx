import React from 'react';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const DashboardCard = ({ title, value }) => {
  return (
    <div className="bg-[#1F1F2E] p-4 mb-4 rounded-lg shadow-lg w-full max-w-sm flex flex-col">
      <div className="flex items-center">
        <div className="bg-green-500 p-2 rounded-full flex-none" style={{ flexBasis: '10%' }}>
          <MonetizationOnIcon />
        </div>
        <div className="ml-3 text-center flex-grow" style={{ flexBasis: '85%' }}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
