"use client"
import React, { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import '../globals.css';
import MenuComponent from './menu'; // Ensure the correct path

const SideMenu: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  console.log("🚀 ~ menuOpen:", menuOpen);

  const handleStateChange = (state: { isOpen: boolean }) => {
    console.log("🚀 ~ handleStateChange ~ state.isOpen:", state.isOpen);
    setMenuOpen(state.isOpen);
  };

  const closeMenu = () => {
    console.log("🚀 ~ closeMenu ~ called");
    setMenuOpen(false);
  };

  const showSettings = (event: React.MouseEvent) => {
    event.preventDefault();
    alert('Settings clicked!');
    closeMenu();
  };

  return (
    <div className="relative">
      <MenuComponent 
        menuOpen={menuOpen}
        handleStateChange={handleStateChange}
        closeMenu={closeMenu}
        showSettings={showSettings}
      />
      <button
        className={`fixed top-4 left-4 border-none bg-transparent cursor-pointer transform `}
        onClick={() => handleStateChange({ isOpen: !menuOpen })}
      >
        <MenuIcon className="text-pink-500" />
      </button>
    </div>
  );
}

export default SideMenu;
