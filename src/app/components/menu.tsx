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
import TopicIcon from '@mui/icons-material/Topic';
import PeopleIcon from '@mui/icons-material/People';
import SupportIcon from '@mui/icons-material/Support';
import LanguageIcon from '@mui/icons-material/Language';
import { Hexagon } from '@mui/icons-material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import '../globals.css';
import get from 'lodash/get';
import { checkAuthToken } from "@utils/checkAuthToken";
import LogoutButton from './profileButton';
import axios from 'axios';
import { tree } from 'next/dist/build/templates/app-page';
import { Rol } from '@constants/roles';

interface MenuProps {
  menuOpen: boolean;
  handleStateChange: (state: { isOpen: boolean }) => void;
  closeMenu: () => void;
  showSettings: (event: React.MouseEvent) => void;
}

const MenuComponent: React.FC<MenuProps> = ({ menuOpen, handleStateChange, closeMenu, showSettings }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownOpenCC, setDropdownOpenCC] = useState(false);
  const [dropdownOpenRequest, setDropdownOpenRequest] = useState(false);
  const [dropdownOpenTramites, setDropdownOpenTramites] = useState(false);
  const pathname = usePathname();

  const [formData, setFormData] = useState<{
    cuenta: string;
    email: string;
    rol: Rol | string;
  }>({
    cuenta: "",
    email: "",
    rol: "",
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (menuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen, isMobile]);

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
          console.log("🚀 ~ fetchUser ~ user:", user)

          const rawRole = get(user, 'solicitud.rol', 0);
          console.log("🚀 ~ fetchUser ~ rawRole:", rawRole)

          const roleMapping: { [key: number]: string } = {
            99: Rol.SUPER_ADMIN,
            90: Rol.ADMINISTRADOR,
            80: Rol.AUDITOR,
            50: Rol.CAJA_CHICA,
            40: Rol.ABOGADOS,
            35: Rol.ASISTENTE,
            17: Rol.CLIENTE_RECURRENTE,
            10: Rol.CLIENTE,
          };
          const stringRole = typeof rawRole === 'string' ? rawRole : roleMapping[rawRole] || "Desconocido";
          console.log("🚀 ~ fetchUser ~ stringRole:", stringRole)


          setFormData((prevData) => ({
            ...prevData,
            rol: stringRole,
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

  const toggleDropdownRequest = () => {
    setDropdownOpenRequest(!dropdownOpenRequest);
  };

  const toggleDropdownTramites = () => {
    setDropdownOpenTramites(!dropdownOpenTramites);
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
        bmMenuWrap: {
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          left: 0,
          width: isMobile ? '100vw' : '18rem',
          height: '100vh',
          zIndex: 9999,
          backgroundColor: '#1E1E2D', // importante en móvil para que no sea transparente
        },
        bmMenu: {
          background: '#1E1E2D',
          padding: '2rem 1rem 0',
          fontSize: '1.15em',
          height: '100vh',
          overflowY: 'auto',
        },
        bmOverlay: {
          background: isMobile ? 'rgba(0, 0, 0, 0.8)' : 'transparent',
          zIndex: 9998,
        },
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
      {/* Solicitudes con submenú */}
      <div
        className={`flex items-center cursor-pointer p-2 rounded ${isActive('/dashboard/requests')}`}
        onClick={toggleDropdownRequest}
      >
        <FeedIcon className="mr-2" />
        <span className="flex-grow font-semibold">Solicitudes</span>
        {dropdownOpenRequest ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </div>

      {dropdownOpenRequest && (
        <div className="ml-6 transition-all">
          <Link
            href="/dashboard/requests"
            className={`block mb-2 px-4 py-2 rounded-xl font-semibold ${isActive('/dashboard/requests') ? 'bg-profile text-white' : 'text-gray-300'
              }`}
            onClick={closeMenu}
          >
            Generales
          </Link>
          <Link
            href="/dashboard/requestsDraft"
            className={`block mb-2 px-4 py-2 rounded-xl font-semibold ${isActive('/dashboard/requestsDraft') ? 'bg-profile text-white' : 'text-gray-300'
              }`}
            onClick={closeMenu}
          >
            Borrador
          </Link>
        </div>
      )}

      {formData?.rol && (formData.rol === Rol.CLIENTE_RECURRENTE || formData.rol === Rol.SUPER_ADMIN) && (
        <div
          className={`flex items-center cursor-pointer p-2 rounded ${isActive('/dashboard/nuevo')}`}
          onClick={toggleDropdown}
        >
          <Hexagon className="mr-2" />
          <span className="flex-grow">Nuevo</span>
          {dropdownOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </div>
      )}



      {dropdownOpen && (
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
          <Link href="/request/paz-salvos" className="block mb-4">
            Paz y Salvos
          </Link>
        </div>
      )}
      {formData?.rol && (
        [Rol.ASISTENTE, Rol.ABOGADOS, Rol.CAJA_CHICA, Rol.AUDITOR, Rol.ADMINISTRADOR, Rol.SUPER_ADMIN].includes(formData.rol as Rol)
      ) && (
          <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/balances')}`}>
            <PaidIcon className="mr-2" />
            <Link href="/dashboard/balances" className='font-semibold' onClick={closeMenu}>
              Balances
            </Link>
          </div>
        )}
      {formData?.rol && (
        [Rol.CAJA_CHICA, Rol.AUDITOR, Rol.ADMINISTRADOR, Rol.SUPER_ADMIN].includes(formData.rol as Rol)
      ) && (
          <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/clients')}`}>
            <PeopleIcon className="mr-2" />
            <Link href="/dashboard/clients" className='font-semibold' onClick={closeMenu}>
              Clientes
            </Link>
          </div>
        )}
      {formData?.rol && (
        [Rol.AUDITOR, Rol.ADMINISTRADOR, Rol.SUPER_ADMIN].includes(formData.rol as Rol)
      ) && (
          <div className={`flex items-center mb-1 p-2 rounded ${isActive('/dashboard/users')}`}>
            <PeopleIcon className="mr-2" />
            <Link href="/dashboard/users" className='font-semibold' onClick={closeMenu}>
              Usuarios
            </Link>
          </div>
        )}
      {formData?.rol && (
        [Rol.ASISTENTE, Rol.ABOGADOS, Rol.CAJA_CHICA, Rol.AUDITOR, Rol.ADMINISTRADOR, Rol.SUPER_ADMIN].includes(formData.rol as Rol)
      ) && (
          <>
            <p className='font-bold'>Trámites internos</p>
            <div className="mb-2">
              {/* Caja chica dropdown */}
              <div className="flex items-center cursor-pointer p-2 rounded" onClick={toggleDropdownCC}>
                <StickyNote2Icon className="mr-2" />
                <span className="flex-grow">Caja chica</span>
                <ArrowDropDownIcon />
              </div>
              {dropdownOpenCC && (
                <div className="ml-6 transition-all">
                  <Link href="/dashboard/disbursement" className={`block mb-2 ${isActive('/dashboard/disbursement')}`} onClick={closeMenu}>
                    Solicitar Desembolso
                  </Link>
                  <Link href="/dashboard/see" className={`block mb-2 ${isActive('/dashboard/see')}`} onClick={closeMenu}>
                    Ver Desembolsos
                  </Link>
                  <Link href="/dashboard/see-invoices" className={`block mb-2 ${isActive('/dashboard/see-invoices')}`} onClick={closeMenu}>
                    Ver Facturas
                  </Link>
                  <Link href="/dashboard/see-expenses" className={`block mb-2 ${isActive('/dashboard/see-expenses')}`} onClick={closeMenu}>
                    Ver Gastos
                  </Link>
                </div>
              )}
              <div className={`flex w-full items-center mb-1 p-2 rounded ${isActive('/dashboard/balances')}`}> 
                <PaidIcon className="mr-2" />
                <Link href="/dashboard/balances" className='font-semibold' onClick={closeMenu}>
                  Balances
                </Link>
              </div>


              <div className={`flex items-center cursor-pointer p-2 rounded ${isActive('/dashboard/create-process') || isActive('/dashboard/my-records')}`}
                onClick={toggleDropdownTramites}
              >
                <TopicIcon className="mr-2" />
                <span className="flex-grow">Trámites</span>
                {dropdownOpenTramites ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
              </div>
              {dropdownOpenTramites && (
                <div className="ml-6 mt-2 transition-all">
                  <Link href="/dashboard/create-process" className={`block mb-2 ${isActive('/dashboard/create-process')}`} onClick={closeMenu}>
                    Crear Trámite
                  </Link>
                  <Link href="/dashboard/my-records" className={`block mb-2 ${isActive('/dashboard/my-records')}`} onClick={closeMenu}>
                    Mis Expedientes
                  </Link>
                </div>
              )}
            </div>
          </>
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
        <Link href="/home" onClick={closeMenu}>
          Sitio Web
        </Link>
      </div>
    </Menu>
  );
}

export default MenuComponent;