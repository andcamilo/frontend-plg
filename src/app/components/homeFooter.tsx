import React from 'react';
import Image from 'next/image';
import Logo from '@public/images/legix.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCcVisa, faCcMastercard, faBitcoin } from '@fortawesome/free-brands-svg-icons';
import { faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

const HomeFooter: React.FC = () => {
  return (
    <footer className="bg-component text-white py-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
      
        <div>
          <Image src={Logo} alt="Logo" width={210} height={82} className="mr-8" />
          <p className='text-gray-200'>Trámites Legales en Línea de Panama Legal Group.</p>
        </div>

      
        <div>
          <h4 className="font-bold text-xl mb-4">Solicitudes</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/request/consulta-propuesta" className="hover:underline block">
                Consulta - Propuesta legal
              </Link>
            </li>
            <li>
              <Link href="/request/pension-alimenticia" className="hover:underline block">
                Pensión Alimenticia
              </Link>
            </li>
            <li>
              <Link href="/request/sociedad-empresa" className="hover:underline block">
                Sociedades / Empresas
              </Link>
            </li>
            <li>
              <Link href="/request/fundacion" className="hover:underline block">
                Fundaciones de Interés Privado
              </Link>
            </li>
          </ul>
        </div>



        <div>
          <h4 className="font-bold  text-xl mb-4">Mi Cuenta</h4>
          <ul>
            <li><a href="/ingresar" className="hover:underline">Ingresar</a></li>
            <li><a href="/corporativo" className="hover:underline font-bold">Corporativo</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold  text-xl mb-4">Nosotros</h4>
          <ul>
            <li><a href="/sobre-nosotros" className="hover:underline">Sobre nosotros</a></li>
            <li><a href="/ayuda" className="hover:underline">Ayuda</a></li>
            <li><a href="/contacto" className="hover:underline">Contacto</a></li>
            <li><a href="/" className="hover:underline">FAQs</a></li>
            <li><a href="/privacidad" className="hover:underline">Políticas de privacidad</a></li>
            <li><a href="/terminos" className="hover:underline">Términos y condiciones</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        <h4 className="font-bold  text-xl mb-4">Aceptamos:</h4>
        <div className="flex space-x-4">
          <FontAwesomeIcon icon={faCcVisa} size="2x" />
          <FontAwesomeIcon icon={faCcMastercard} size="2x" />
          <FontAwesomeIcon icon={faBitcoin} size="2x" />
          <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
