"use client"
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import '@app/globals.css';
import MenuComponent from './menu'; 

const SideMenu: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleStateChange = (state: { isOpen: boolean }) => {
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const showSettings = (event: React.MouseEvent) => {
    event.preventDefault();
    alert('Settings clicked!');
    closeMenu();
  };

  return (
    <div>
      <MenuComponent 
        menuOpen={menuOpen}
        handleStateChange={handleStateChange}
        closeMenu={closeMenu}
        showSettings={showSettings}
      />
      <button
        className={`fixed top-4 left-14 border-none bg-transparent cursor-pointer transform z-50`}
        onClick={() => handleStateChange({ isOpen: !menuOpen })}
      >
        <MenuIcon className="text-profile" />
      </button>
    </div>
  );
}

export default SideMenu;
