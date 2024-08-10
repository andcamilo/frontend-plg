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
      return <BusinessCenterIcon className="text-white text-4xl" />;
    } else {
      return <AccountBalanceIcon className="text-white text-4xl" />;
    }
  };

  return (
    <div className="bg-[#1F1F2E] text-center p-1 rounded-lg shadow-lg flex flex-col justify-center items-center w-full h-52">
      <div className={`${color} p-2 rounded-md mb-4`}>
        {renderIcon()}
      </div>
      <h2 className="text-lg font-semibold text-gray-400">{title}</h2>
      <p className="text-2xl font-bold text-white">{number}</p>
    </div>
  );
}

export default HomeBox;
