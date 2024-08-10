import React from 'react';
import SideMenu from '@components/sideMenu';
import LegixStadistics from '@components/legixStadistics';
import Footer from '@components/footer';
import ProfileButton from '@components/profileButton';

const Home: React.FC = () => {
  return (
    <div className="flex bg-[#151521] min-h-screen">
      <SideMenu />
      <div id="page-wrap" className="flex items-start justify-start flex-grow flex-col pt-16 pl-6">
          <div className="flex items-center justify-between w-full pr-8">
            <h1 className="text-4xl font-bold text-white pl-8">
              Estadísticas de LEGIX
            </h1>
            <ProfileButton />
          </div>
        <LegixStadistics />
        <Footer />
      </div>
    </div>
  );
}

export default Home;
