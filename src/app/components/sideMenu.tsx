"use client";
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import '@app/globals.css';
import { slide as BurgerMenu } from 'react-burger-menu';
import Image from 'next/image';
import Logo from '@public/images/legix.png';

const NavBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStateChange = (state: { isOpen: boolean }) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="w-full bg-[#1A1A1A] text-white">
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Image src={Logo} alt="Logo" width={210} height={82} className="mr-8" />
          </div>
          <a href="#" className="text-xl font-bold hover:text-profile">Inicio</a>
          <a href="#" className="text-xl font-bold hover:text-profile">Solicitudes</a>
          <a href="#" className="text-xl font-bold hover:text-profile">FAQs</a>
          <a href="#" className="text-xl font-bold hover:text-profile">Mi Cuenta</a>
          <a href="#" className="text-xl font-bold hover:text-profile">Ayuda</a>
        </div>
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
      <div className=" flex items-center justify-between px-4 py-4">
        <Image src={Logo} alt="Logo" width={120} height={47} />
        <button
          className={`border-none bg-transparent cursor-pointer transform z-50`}
          onClick={() => handleStateChange({ isOpen: !menuOpen })}
        >
          <MenuIcon className="text-profile" />
        </button>
      </div>

      <BurgerMenu
        right
        isOpen={menuOpen}
        onStateChange={handleStateChange}
      >
        <a id="home" className="menu-item" href="#">Inicio</a>
        <a id="solicitudes" className="menu-item" href="#">Solicitudes</a>
        <a id="faqs" className="menu-item" href="#">FAQs</a>
        <a id="mi-cuenta" className="menu-item" href="#">Mi Cuenta</a>
        <a id="ayuda" className="menu-item" href="#">Ayuda</a>
        <a id="corporativo" className="menu-item" href="#">Corporativo</a>
      </BurgerMenu>
    </nav>
  );
}

export default NavBar;
