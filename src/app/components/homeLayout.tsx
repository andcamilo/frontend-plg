import React from 'react';
import NavBar from '@components/navBar';
import HomeFooter from '@components/homeFooter';

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#151521]">
      <NavBar />
      <div className="flex-grow ">
        {children}
      </div>
      <HomeFooter />
    </div>
  );
}

export default HomeLayout;
