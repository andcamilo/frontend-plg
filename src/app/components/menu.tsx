import React, { useState, useEffect } from 'react';
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
import { Hexagon } from '@mui/icons-material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import '../globals.css';
import { checkAuthToken } from "@utils/checkAuthToken";
import axios from 'axios';

interface MenuProps {
  menuOpen: boolean;
  handleStateChange: (state: { isOpen: boolean }) => void;
  closeMenu: () => void;
  showSettings: (event: React.MouseEvent) => void;
}

const MenuComponent: React.FC<MenuProps> = ({ menuOpen, handleStateChange, closeMenu, showSettings }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenCC, setDropdownOpenCC] = useState(false);
  const pathname = usePathname();

  const [formData, setFormData] = useState<{
    cuenta: string;
    email: string;
    rol: number;
  }>({
    cuenta: "",
    email: "",
    rol: -1,

  });

  useEffect(() => {
    const userData = checkAuthToken();
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        email: userData?.email,
        cuenta: userData?.user_id,
      }));
    }
  }, []);

  useEffect(() => {
    if (formData.cuenta) {
      const fetchUser = async () => {
        try {
          console.log("Cuenta ", formData.cuenta)
          const response = await axios.get('/api/get-user-cuenta', {
            params: { userCuenta: formData.cuenta },
          });

          const user = response.data;
          console.log("Usuario ", user)
          setFormData((prevData) => ({
            ...prevData,
            rol: user.solicitud.rol || 0,
          }));

        } catch (error) {
          console.error('Failed to fetch solicitudes:', error);
        }
      };

      fetchUser();
    }
  }, [formData.cuenta]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleDropdownCC = () => {
    setDropdownOpenCC(!dropdownOpenCC);
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
      {formData?.rol && (formData.rol === 17 || formData.rol === 99) && (
        <div
          className={`flex items-center cursor-pointer p-2 rounded ${isActive('/dashboard/nuevo')}`}
          onClick={toggleDropdown}
        >
          <Hexagon className="mr-2" />
          <span className="flex-grow">Nuevo</span>
          {dropdownOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </div>
      )}

      {/* Opciones desplegables */}
      {dropdownOpenCC && (
        <div className="ml-6 transition-all">
          <Link href="/dashboard/tramite-general" className="block mb-4">
            Trámite General
          </Link>
          <Link href="/request/consulta-propuesta" className="block mb-4">
            Consulta - Propuesta Legal
          </Link>
          <Link href="/request/pension-alimenticia" className="block mb-4">
            Pensión Alimenticia
          </Link>
          <Link href="/request/sociedad-empresa" className="block mb-4">
            Sociedades / Empresas
          </Link>
          <Link href="/request/fundacion" className="block mb-4">
            Fundaciones de Interés Privado
          </Link>
        </div>
      )}
      {formData?.rol && formData.rol >= 35 && (
        <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/balances')}`}>
          <PaidIcon className="mr-2" />
          <Link href="/dashboard/balances" className='font-semibold' onClick={closeMenu}>
            Balances
          </Link>
        </div>
      )}
      {formData?.rol && formData.rol >= 50 && (
        <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/clients')}`}>
          <PeopleIcon className="mr-2" />
          <Link href="/dashboard/clients" className='font-semibold' onClick={closeMenu}>
            Clientes
          </Link>
        </div>
      )}
      {formData?.rol && formData.rol >= 80 && (
        <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/users')}`}>
          <PeopleIcon className="mr-2" />
          <Link href="/dashboard/users" className='font-semibold' onClick={closeMenu}>
            Usuarios
          </Link>
        </div>
      )}
      {formData?.rol && formData.rol >= 35 && (
        <>
          <p className='font-bold'>Trámites internos</p>
          <div className="flex items-center mb-2 cursor-pointer p-2 rounded" onClick={toggleDropdownCC}>
            <StickyNote2Icon className="mr-2" />
            <span className="flex-grow">Caja chica</span>
            <ArrowDropDownIcon />
          </div>
        </>
      )}
      {dropdownOpenCC && (
        <div className="ml-6 transition-all">
          <Link href="/dashboard/disbursement" className={`block mb-2  ${isActive('/dashboard/disbursement')}`} onClick={closeMenu}>
            Solcitar Desembolso
          </Link>
          <Link href="/dashboard/see" className={`block mb-2 ${isActive('/dashboard/see')}`} onClick={closeMenu}>
            Ver Desembolsos
          </Link>
          <Link href="/dashboard/expense" className={`block mb-2 ${isActive('/dashboard/expense')}`} onClick={closeMenu}>
            Crear Gasto
          </Link>

        </div>
      )}
      <p className='font-bold'>Otros enlaces</p>
      <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/faqs')}`}>
        <SupportIcon className="mr-2" />
        <Link href="/dashboard/faqs" onClick={closeMenu}>
          FAQs
        </Link>
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