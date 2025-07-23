import '@app/globals.css';
import Logo from '@public/images/legix.png';
import React, { useState } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Image from 'next/image';
import Link from 'next/link';
import { checkAuthToken } from '@utils/checkAuthToken';
import { MessageCircle, Home, Menu as MenuIcon, User } from 'lucide-react';

interface Tramite {
  tramite: string;
  redirect: string;
}

const tramites: Tramite[] = [
  { tramite: 'Consulta - Propuesta legal', redirect: '/request/consulta-propuesta' },
  { tramite: 'Pensión Alimenticia', redirect: '/request/pension-alimenticia' },
  { tramite: 'Salida de Menores al Extranjero', redirect: '/request/menores-extranjero' },
  { tramite: 'Sociedades / Empresas', redirect: '/request/sociedad-empresa' },
  { tramite: 'Fundaciones de Interés Privado', redirect: '/request/fundacion' }
];

const NavBar = () => {
  const [solicitudesAnchorEl, setSolicitudesAnchorEl] = useState<null | HTMLElement>(null);
  const [faqsAnchorEl, setFaqsAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTramites, setFilteredTramites] = useState<Tramite[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();

  const handleSolicitudesMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSolicitudesAnchorEl(event.currentTarget);
  };

  const handleSolicitudesClose = () => setSolicitudesAnchorEl(null);
  const handleFaqsMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => setFaqsAnchorEl(event.currentTarget);
  const handleFaqsMenuClose = () => setFaqsAnchorEl(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term) {
      setFilteredTramites(tramites.filter((item) => item.tramite.toLowerCase().includes(term.toLowerCase())));
      setActiveIndex(-1);
    } else {
      setFilteredTramites([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, filteredTramites.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleTramiteClick(filteredTramites[activeIndex].redirect);
    }
  };

  const handleTramiteClick = async (redirectUrl: string) => {
    setIsLoading(true);
    try {
      await router.push(redirectUrl);
    } finally {
      setIsLoading(false);
      setIsMobileMenuOpen(false);
    }
  };

  const handleMiCuentaClick = () => {
    const auth = checkAuthToken();
    router.push(auth ? '/dashboard/home' : '/login');
    setIsMobileMenuOpen(false);
  };

  const navLinkClass = 'text-xl font-bold hover:text-profile';

  return (
    <nav className="w-full bg-[#1C1A1F] text-white">
      {/* Desktop Navbar */}
      <div className="hidden md:flex items-center justify-between px-8 py-4">
        <div className="flex items-center space-x-8">
          <Link href="/home">
            <Image src={Logo} alt="Logo" width={210} height={82} className="mr-8" />
          </Link>
          <Link href="/home" className={navLinkClass}>Inicio</Link>
          <IconButton onClick={handleSolicitudesMenuClick} className={navLinkClass} sx={{ color: 'white' }}>
            Solicitudes <ArrowDropDownIcon />
          </IconButton>
          <Menu anchorEl={solicitudesAnchorEl} open={Boolean(solicitudesAnchorEl)} onClose={handleSolicitudesClose}
            PaperProps={{ style: { backgroundColor: '#1F1F2E', color: 'white' } }}>
            {tramites.map((t, i) => (
              <MenuItem key={i} onClick={() => handleTramiteClick(t.redirect)}>{t.tramite}</MenuItem>
            ))}
          </Menu>
          <IconButton onClick={handleFaqsMenuClick} className={navLinkClass} sx={{ color: 'white' }}>
            FAQs <ArrowDropDownIcon />
          </IconButton>
          <Menu anchorEl={faqsAnchorEl} open={Boolean(faqsAnchorEl)} onClose={handleFaqsMenuClose}
            PaperProps={{ style: { backgroundColor: '#1F1F2E', color: 'white' } }}>
            <MenuItem onClick={() => router.push('/faqs')}>Generales</MenuItem>
            <MenuItem onClick={() => router.push('/faqs-sociedades')}>Sociedades</MenuItem>
          </Menu>
          <button onClick={handleMiCuentaClick} className={navLinkClass}>Mi Cuenta</button>
          <button
            onClick={() => window.open('https://wa.me/50769853352', '_blank')}
            className={navLinkClass}
          >
            Ayuda
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-xl font-bold bg-profile rounded-lg px-4 py-2 text-white"
            onClick={() => router.push('/request/corporativo')}>Corporativo</button>
          <div className="flex items-center bg-[#292929] px-3 py-1 rounded-full relative">
            <input type="text" placeholder="Buscar Trámite" value={searchTerm} onChange={handleInputChange}
              onKeyDown={handleKeyDown} className="bg-transparent text-white placeholder-gray-400 pl-2 w-full" />
          </div>
        </div>
      </div>

      {/* Mobile Top Logo */}
      <div className="md:hidden pt-1 pb-0 flex justify-center items-start">
        <Link href="/home">
          <Image src={Logo} alt="Logo" width={170} height={55} className="cursor-pointer" />
        </Link>
      </div>

      {/* Mobile Side Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-profile z-[1000] text-white p-6 overflow-y-auto">
          <button className="text-2xl mb-4" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
          <button
            type="button"
            onClick={() => {
              router.push('/home');
              setIsMobileMenuOpen(false);
            }}
            className="block py-2"
          >
            Inicio
          </button>
          {tramites.map((t, i) => (
            <button key={i} className="block py-2" onClick={() => handleTramiteClick(t.redirect)}>{t.tramite}</button>
          ))}
          <hr className="my-4 border-white/30" />
          <button
            type="button"
            onClick={() => {
              router.push('/faqs');
              setIsMobileMenuOpen(false);
            }}
            className="block py-2"
          >
            FAQs
          </button>

          <button
            type="button"
            onClick={() => {
              router.push('/faqs-sociedades');
              setIsMobileMenuOpen(false);
            }}
            className="block py-2"
          >
            FAQs Sociedades
          </button>
          <button className="block py-2" onClick={handleMiCuentaClick}>Mi Cuenta</button>
          <button
            onClick={() => window.open('https://wa.me/50769853352', '_blank')}
            className="block py-2"
          >
            Ayuda
          </button>

          <button
            type="button"
            className="mt-4 bg-white text-black px-4 py-2 rounded-lg"
            onClick={() => {
              router.push('/request/corporativo');
              setIsMobileMenuOpen(false);
            }}
          >
            Corporativo
          </button>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 w-full bg-[#1C1A1F] border-t border-gray-700 flex justify-around items-center py-2 md:hidden z-40">
        <button
          type="button"
          onClick={() => router.push('/home')}
          className="flex flex-col items-center text-white"
        >
          <Home size={20} />
          <span className="text-xs">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex flex-col items-center text-white"
        >
          <MenuIcon size={20} />
          <span className="text-xs">Menú</span>
        </button>

        <button
          type="button"
          onClick={() => window.open('https://wa.me/50769853352', '_blank')}
          className="flex flex-col items-center text-white"
        >
          <MessageCircle size={20} />
          <span className="text-xs">WhatsApp</span>
        </button>

        <button
          type="button"
          onClick={handleMiCuentaClick}
          className="flex flex-col items-center text-white"
        >
          <User size={20} />
          <span className="text-xs">Cuenta</span>
        </button>
      </div>

      {
        isLoading && (
          <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-[999]">
            <div className="text-white text-xl">Cargando...</div>
          </div>
        )
      }
    </nav >
  );
};

export default NavBar;
