import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import '../globals.css';

interface MenuProps {
  menuOpen: boolean;
  handleStateChange: (state: { isOpen: boolean }) => void;
  closeMenu: () => void;
  showSettings: (event: React.MouseEvent) => void;
}

const MenuComponent: React.FC<MenuProps> = ({ menuOpen, handleStateChange, closeMenu, showSettings }) => {
  return (
    <Menu 
      isOpen={menuOpen}
      onStateChange={(state) => handleStateChange(state)}
      customBurgerIcon={false}
      customCrossIcon={false}
      disableAutoFocus
      styles={{
        bmOverlay: {
          background: "rgba(0, 0, 0, 0.3)",
          zIndex: 10,
        },
        bmMenuWrap: {
          zIndex: 20,
          width: '220px' 
        }
      }}
    >
      <a id="home" href="/" onClick={closeMenu}>Home</a>
      <a id="about" href="/about" onClick={closeMenu}>About</a>
      <a id="contact" href="/contact" onClick={closeMenu}>Contact</a>
      <a onClick={showSettings} href="">Settings</a>
    </Menu>
  );
}

export default MenuComponent;
