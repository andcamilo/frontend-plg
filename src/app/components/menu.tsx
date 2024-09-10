import React, { useState } from 'react';
import { slide as Menu } from 'react-burger-menu';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import Logo from '@public/images/legix-logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FeedIcon from '@mui/icons-material/Feed';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';
import SupportIcon from '@mui/icons-material/Support';
import LanguageIcon from '@mui/icons-material/Language';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { useRouter } from 'next/router';
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
  const router = useRouter();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleRedirect = () => {
    router.push('https://legixdev.mgpanel.org/pag/faqs');
    closeMenu();
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
        <Link href="/dashboard/home" className='font-semibold' onClick={closeMenu}>
          Dashboard
        </Link>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/requests')}`}>
        <FeedIcon className="mr-2" />
        <Link href="/dashboard/requests" className='font-semibold' onClick={closeMenu}>
          Solicitudes
        </Link>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/balances')}`}>
        <PaidIcon className="mr-2" />
        <Link href="/dashboard/balances" className='font-semibold' onClick={closeMenu}>
          Balances
        </Link>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/clients')}`}>
        <PeopleIcon className="mr-2" />
        <Link href="/dashboard/clients" className='font-semibold' onClick={closeMenu}>
          Clientes
        </Link>
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/users')}`}>
        <AccountBoxIcon className="mr-2" />
        <Link href="/dashboard/users" className='font-semibold' onClick={closeMenu}>
          Usuarios
        </Link>
      </div>
      <p className='font-bold'>Trámites internos</p>
      <div className="flex items-center mb-2 cursor-pointer p-2 rounded" onClick={toggleDropdown}>
        <StickyNote2Icon className="mr-2" />
        <span className="flex-grow">Caja chica</span>
        <ArrowDropDownIcon />
      </div>
      {dropdownOpen && (
        <div className="ml-6 transition-all">
          <Link href="/dashboard/desembolso" className={`block mb-2 ${isActive('/dashboard/desembolso')}`} onClick={closeMenu}>
            Desembolso
          </Link>
          <Link href="/dashboard/reports" className={`block mb-2 ${isActive('/dashboard/reports')}`} onClick={closeMenu}>
            Reportes
          </Link>
        </div>
      )}
      <p className='font-bold'>Otros enlaces</p>
      <div className={`flex items-center mb-1 p-2 rounded`}>
        <Link href="/dashboard/faqs" className={`block mb-2 ${isActive('/dashboard/faqs')}`} onClick={closeMenu}>
          <SupportIcon className="mr-2" />
          FAQs
        </Link>
        {/* <div onClick={handleRedirect} className="cursor-pointer">
          <SupportIcon className="mr-2" />
          FAQs
        </div> */}
      </div>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('')}`}>
        <LanguageIcon className="mr-2" />
        <Link href="" onClick={closeMenu}>
          Sitio Web
        </Link>
      </div>
    </Menu>
  );
}

export default MenuComponent;
