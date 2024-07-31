import React from 'react';
import { slide as Menu } from 'react-burger-menu';
import CloseIcon from '@mui/icons-material/Close'; // Import the Close icon from Material-UI
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
        },
        bmMenu: {
          padding: '2.5em 1.5em 0',
        }
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <div />
        <button onClick={closeMenu} className="text-white">
          <CloseIcon />
        </button>
      </div>
      <a id="home" href="/" onClick={closeMenu}>Home</a>
      <a id="about" href="/about" onClick={closeMenu}>About</a>
      <a id="contact" href="/contact" onClick={closeMenu}>Contact</a>
      <a onClick={showSettings} href="">Settings</a>
    </Menu>
  );
}

export default MenuComponent;
