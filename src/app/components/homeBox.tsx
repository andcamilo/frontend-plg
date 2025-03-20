import React from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

interface HomeBoxProps {
  title: string;
  number: number;
  color: string;
}

const HomeBox: React.FC<HomeBoxProps> = ({ title, number, color }) => {
  const renderIcon = () => {
    if (title === "Otros") {
      return <BusinessCenterIcon className="text-white text-3xl" />;
    } else {
      return <AccountBalanceIcon className="text-white text-3xl" />;
    }
  };

  return (
    <div className="bg-component text-center rounded-lg shadow-lg flex flex-col justify-center items-center h-[100px] w-[98%]">
      <div className={`${color} rounded-md mb-1`}>
        {renderIcon()}
      </div>
      <h2 className="text-xs font-semibold text-gray-400">{title}</h2>
      <p className="text-md font-bold text-white">{number}</p>
    </div>
  );
}

export default HomeBox;
