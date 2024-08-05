import React from 'react';
import SideMenu from '@/app/components/sideMenu';
import LegixStadistics from '@/app/components/legixStadistics';
import Footer from '@/app/components/footer';

const Login: React.FC = () => {
  return (
    <div className="flex bg-[#151521] min-h-screen">
      <SideMenu />
      <div id="page-wrap" className="flex items-start justify-start flex-grow flex-col pt-16 pl-6">
        <h1 className="text-4xl font-bold text-white pl-8">
          Estadísticas de LEGIX
        </h1>
        <LegixStadistics />
        <Footer />
      </div>
    </div>
  );
}

export default Login;
