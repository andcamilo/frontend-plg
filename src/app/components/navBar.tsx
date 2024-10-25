import '@app/globals.css';
import Logo from '@public/images/legix.png';
import React, { useState } from 'react';
import { slide as BurgerMenu } from 'react-burger-menu';  // Import BurgerMenu correctly
import { Menu, MenuItem, IconButton } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from 'next/image';
import Link from 'next/link';

const NavBar = () => {
  const [solicitudesAnchorEl, setSolicitudesAnchorEl] = useState<null | HTMLElement>(null);
  const [faqsAnchorEl, setFaqsAnchorEl] = useState<null | HTMLElement>(null);

  const handleSolicitudesMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSolicitudesAnchorEl(event.currentTarget);
  };

  const handleFaqsMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFaqsAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setSolicitudesAnchorEl(null);
    setFaqsAnchorEl(null);
  };

  return (
    <nav className="w-full bg-[##1C1A1F] text-white">
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Image src={Logo} alt="Logo" width={210} height={82} className="mr-8" />
          </div>
            <Link href="/home" className='text-xl font-bold hover:text-profile'>
              Inicio
            </Link>

            <IconButton
              onClick={handleSolicitudesMenuClick}
              className="text-xl text-white font-bold hover:text-profile"
              style={{ padding: 0 }}
            >
              Solicitudes <ArrowDropDownIcon />
            </IconButton>
            <Menu
              id="solicitudes-menu"
              anchorEl={solicitudesAnchorEl}
              keepMounted
              open={Boolean(solicitudesAnchorEl)}
              onClose={handleClose}
              MenuListProps={{ onMouseLeave: handleClose }}
              PaperProps={{
                style: {
                  backgroundColor: '#1F1F2E',
                  color: 'white',
                },
              }}
            >
              <MenuItem onClick={handleClose} sx={{ px: 3 }}>Pensión Alimenticia</MenuItem>
            </Menu>

          <Link href="/faqs" className='text-xl font-bold hover:text-profile'>
            FAQs
          </Link>
          <Link href="/login" className='text-xl font-bold hover:text-profile'>
            Mi Cuenta
          </Link>
          <a href="#" className="text-xl font-bold hover:text-profile">Ayuda</a>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          <button className="text-xl font-bold bg-profile rounded-lg px-4 py-2 hover:text-profile">Corporativo</button>
          <div className="flex items-center bg-[#292929] px-3 py-1 rounded-full">
            <input
              type="text"
              placeholder="Buscar Trámite"
              className="bg-transparent text-white placeholder-gray-400 pl-2"
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 111.5-1.5L21 21z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <BurgerMenu right>
          <a id="home" className="menu-item" href="#">Inicio</a>
          <a id="solicitudes" className="menu-item" href="#">Solicitudes</a>
          <a id="faqs" className="menu-item" href="#">FAQs</a>
          <a id="mi-cuenta" className="menu-item" href="#">Mi Cuenta</a>
          <a id="ayuda" className="menu-item" href="#">Ayuda</a>
          <a id="corporativo" className="menu-item" href="#">Corporativo</a>
        </BurgerMenu>
      </div>
    </nav>
  );
};

export default NavBar;
