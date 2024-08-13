import React from 'react';
import SideMenu from '@components/sideMenu';
import Footer from '@components/footer';
import ProfileButton from '@components/profileButton';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  return (
    <div className="flex bg-[#151521] min-h-screen">
      <SideMenu />
      <div id="page-wrap" className="flex items-start justify-start flex-grow flex-col pt-16 pl-6">
        <div className="flex items-center justify-between w-full pr-8">
          <h1 className="text-4xl font-bold text-white pl-8">
            {title}
          </h1>
          <ProfileButton />
        </div>
        {children}
        <Footer />
      </div>
    </div>
  );
}

export default DashboardLayout;
