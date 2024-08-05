import React, { useState } from 'react';
import { slide as Menu } from 'react-burger-menu';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image'; 
import { usePathname } from 'next/navigation'
import Logo from '../../../public/images/legix-logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FeedIcon from '@mui/icons-material/Feed';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import SupportIcon from '@mui/icons-material/Support';
import LanguageIcon from '@mui/icons-material/Language';
import '../globals.css';

interface MenuProps {
  menuOpen: boolean;
  handleStateChange: (state: { isOpen: boolean }) => void;
  closeMenu: () => void;
  showSettings: (event: React.MouseEvent) => void;
}

const MenuComponent: React.FC<MenuProps> = ({ menuOpen, handleStateChange, closeMenu, showSettings }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const isActive = (path: string) => pathname === path ? 'bg-profile text-white rounded-xl' : '';

  return (
    <Menu 
      isOpen={menuOpen}
      onStateChange={(state) => handleStateChange(state)}
      customBurgerIcon={false}
      customCrossIcon={false}
      disableAutoFocus
      styles={{
        bmMenu: {
          background: '#1E1E2D',
        }
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center justify-between w-full">
          <Image src={Logo} alt="Logo" width={110} height={32} className="mr-2" /> 
          <button onClick={closeMenu} className="text-white">
            <CloseIcon />
          </button>
        </div>
      </div>
      <p className='font-bold'>Menu</p>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/home')}`}>
        <DashboardIcon className="mr-2" />
        <a id="dashboard" href="/dashboard/home" className='font-semibold' onClick={closeMenu}>Dashboard</a>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/solicitudes')}`}>
        <FeedIcon className="mr-2" />
        <a id="solicitudes" href="/dashboard/solicitudes" className='font-semibold' onClick={closeMenu}>Solicitudes</a>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/balances')}`}>
        <PaidIcon className="mr-2" />
        <a id="balances" href="/dashboard/balances" className='font-semibold' onClick={closeMenu}>Balances</a>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/clientes')}`}>
        <PeopleIcon className="mr-2" />
        <a id="clientes" href="/dashboard/clientes" className='font-semibold' onClick={closeMenu}>Clientes</a>
      </div>
      <p className='font-bold'>Trámites internos</p>
      <div className="flex items-center mb-2 cursor-pointer p-2 rounded" onClick={toggleDropdown}>
        <StickyNote2Icon className="mr-2" />
        <span className="flex-grow">Caja chica</span>
        <ArrowDropDownIcon />
      </div>
      {dropdownOpen && (
        <div className="ml-6 transition-all">
          <a id="option1" href="/dashboard/desembolso" onClick={closeMenu} className={`block mb-2 ${isActive('/dashboard/desembolso')}`}>Desembolso</a>
          <a id="option2" href="/dashboard/reportes" onClick={closeMenu} className={`block mb-2 ${isActive('/dashboard/reportes')}`}>Reportes</a>
        </div>
      )}
      <p className='font-bold'>Otros enlaces</p>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/faqs')}`}>
        <SupportIcon className="mr-2" />
        <a id="FAQs" href="/dashboard/faqs" onClick={closeMenu}>FAQs</a>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('')}`}>
        <LanguageIcon className="mr-2" />
        <a id="web" href="" onClick={closeMenu}>Sitio Web</a>
      </div>
    </Menu>
  );
}

export default MenuComponent;
