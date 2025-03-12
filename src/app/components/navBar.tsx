import '@app/globals.css';
import Logo from '@public/images/legix.png';
import React, { useState } from 'react';
import { slide as BurgerMenu } from 'react-burger-menu';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { useRouter } from 'next/router';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from 'next/image';
import Link from 'next/link';
import { checkAuthToken } from "@utils/checkAuthToken";

interface Tramite {
  tramite: string;
  redirect: string;
}

const tramites: Tramite[] = [
  {
    tramite: "Consulta - Propuesta legal",
    redirect: "/request/consulta-propuesta",
  },
  {
    tramite: "Pensión Alimenticia",
    redirect: "/request/pension-alimenticia",
  },
  {
    tramite: "Salida de Menores al Extranjero",
    redirect: "/request/menores-extranjero",
  },
  {
    tramite: "Sociedades / Empresas",
    redirect: "/request/sociedad-empresa",
  },
  {
    tramite: "Fundaciones de Interés Privado",
    redirect: "/request/fundacion",
  },
];

const NavBar = () => {
  const [solicitudesAnchorEl, setSolicitudesAnchorEl] = useState<null | HTMLElement>(null);
  const [faqsAnchorEl, setFaqsAnchorEl] = useState<null | HTMLElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTramites, setFilteredTramites] = useState<Tramite[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  /* ---------------------------
     SOLICITUDES MENU HANDLERS
  --------------------------- */
  const handleSolicitudesMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSolicitudesAnchorEl(event.currentTarget);
  };

  const handleSolicitudesClose = () => {
    setSolicitudesAnchorEl(null);
  };

  /* ---------------------------
     FAQ MENU HANDLERS
  --------------------------- */
  const handleFaqsMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFaqsAnchorEl(event.currentTarget);
  };

  const handleFaqsMenuClose = () => {
    setFaqsAnchorEl(null);
  };

  /* ---------------------------
     SEARCH & NAVIGATION LOGIC
  --------------------------- */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const filtered = tramites.filter((item) =>
        item.tramite.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredTramites(filtered);
      setActiveIndex(-1); // Reset active index when the input changes
    } else {
      setFilteredTramites([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prevIndex) => Math.min(prevIndex + 1, filteredTramites.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleTramiteClick(filteredTramites[activeIndex].redirect);
    }
  };

  const handleTramiteClick = (redirectUrl: string) => {
    setIsLoading(true);
    router.push(redirectUrl).finally(() => setIsLoading(false));
  };

  const handleMiCuentaClick = () => {
    const auth = checkAuthToken();
    if (auth) {
      router.push('/dashboard/home');
    } else {
      router.push('/login');
    }
  };

  return (
    <nav className="w-full bg-[#1C1A1F] text-white">
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        {/* Left Section: Logo & Main Links */}
        <div className="flex items-center space-x-8">
          <Image src={Logo} alt="Logo" width={210} height={82} className="mr-8" />

          <Link href="/home" className="text-xl font-bold hover:text-profile">
            Inicio
          </Link>

          {/* Solicitudes Dropdown */}
          <IconButton
            onClick={handleSolicitudesMenuClick}
            className="text-xl text-white font-bold hover:text-profile"
            style={{ padding: 0 }}
            sx={{
              color: 'white !important',
              padding: 0,
              '&:hover': {
                color: 'white !important',
              },
            }}
          >
            Solicitudes <ArrowDropDownIcon />
          </IconButton>
          <Menu
            id="solicitudes-menu"
            anchorEl={solicitudesAnchorEl}
            keepMounted
            open={Boolean(solicitudesAnchorEl)}
            onClose={handleSolicitudesClose}
            MenuListProps={{ onMouseLeave: handleSolicitudesClose }}
            sx={{ px: 3, color: 'white !important' }}
            PaperProps={{
              style: {
                backgroundColor: '#1F1F2E',
                color: 'white',
              },
            }}
          >
            {tramites.map((tramite, index) => (
              <MenuItem
                key={index}
                sx={{ px: 3, color: 'white !important' }}
                onClick={() => {
                  handleTramiteClick(tramite.redirect);
                  handleSolicitudesClose();
                }}
              >
                {tramite.tramite}
              </MenuItem>
            ))}
          </Menu>

          {/* FAQs Dropdown */}
          <IconButton
            onClick={handleFaqsMenuClick}
            className="text-xl text-white font-bold hover:text-profile"
            style={{ padding: 0 }}
            sx={{
              color: 'white !important',
              padding: 0,
              '&:hover': {
                color: 'white !important',
              },
            }}
          >
            FAQs <ArrowDropDownIcon />
          </IconButton>
          <Menu
            id="faqs-menu"
            anchorEl={faqsAnchorEl}
            keepMounted
            open={Boolean(faqsAnchorEl)}
            onClose={handleFaqsMenuClose}
            MenuListProps={{ onMouseLeave: handleFaqsMenuClose }}
            sx={{ px: 3, color: 'white !important' }}
            PaperProps={{
              style: {
                backgroundColor: '#1F1F2E',
                color: 'white',
              },
            }}
          >
            {/* Option 1: Generales */}
            <MenuItem
              sx={{ px: 3, color: 'white !important' }}
              onClick={() => {
                router.push('/faqs');
                handleFaqsMenuClose();
              }}
            >
              Generales
            </MenuItem>
            {/* Option 2: Sociedades */}
            <MenuItem
              sx={{ px: 3, color: 'white !important' }}
              onClick={() => {
                router.push('/faqs-sociedades');
                handleFaqsMenuClose();
              }}
            >
              Sociedades
            </MenuItem>
          </Menu>

          <button
            onClick={handleMiCuentaClick}
            className="text-xl font-bold hover:text-profile focus:outline-none"
          >
            Mi Cuenta
          </button>
          <a href="#" className="text-xl font-bold hover:text-profile">
            Ayuda
          </a>
        </div>

        {/* Right Section: Corporativo & Search */}
        <div className="flex items-center space-x-4">
          <button
            className="text-xl font-bold bg-profile rounded-lg px-4 py-2 text-white hover:bg-opacity-90"
            onClick={() => (window.location.href = '/request/corporativo')}
          >
            Corporativo
          </button>
          <div className="flex items-center bg-[#292929] px-3 py-1 rounded-full relative">
            <input
              type="text"
              placeholder="Buscar Trámite"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-white placeholder-gray-400 pl-2 w-full"
            />
            <button type="submit" className="p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4 text-[#9A0069]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 111.5-1.5L21 21z"
                />
              </svg>
            </button>
            {filteredTramites.length > 0 && (
              <ul
                className="absolute bg-white text-black mt-1 left-0 w-full rounded shadow-lg z-50"
                style={{ top: '100%' }}
              >
                {filteredTramites.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleTramiteClick(item.redirect)}
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                      index === activeIndex ? 'bg-gray-200' : ''
                    }`}
                  >
                    {item.tramite}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className="md:hidden">
        <BurgerMenu right>
          <Link href="/home" className="menu-item">
            Inicio
          </Link>
          {tramites.map((tramite, index) => (
            <a
              key={index}
              className="menu-item"
              onClick={() => handleTramiteClick(tramite.redirect)}
            >
              {tramite.tramite}
            </a>
          ))}
          {/* Mobile menu items for FAQs */}
          <p className="menu-item font-bold mt-4">FAQs</p>
          <Link href="/faqs" className="menu-item pl-4">
            Generales
          </Link>
          <Link href="/faqs-sociedades" className="menu-item pl-4">
            Sociedades
          </Link>

          <Link href="/login" className="menu-item">
            Mi Cuenta
          </Link>
          <a href="#" className="menu-item">
            Ayuda
          </a>
          <button
            className="menu-item bg-profile text-white px-4 py-2 rounded-lg"
            onClick={() => router.push('/request/corporativo')}
          >
            Corporativo
          </button>
        </BurgerMenu>
      </div>
    </nav>
  );
};

export default NavBar;
