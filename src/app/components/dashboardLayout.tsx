"use client"
import React, { useState } from "react"
import SideMenu from "@components/sideMenu"
import Footer from "@components/footer"
import ProfileButton from "@components/profileButton"

interface DashboardLayoutProps {
  title: string
  children: React.ReactNode
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex bg-[#151521] min-h-screen relative transition-all duration-300">
      <SideMenu
        menuOpen={isOpen}
        handleStateChange={(state) => setIsOpen(state.isOpen)}
        closeMenu={() => setIsOpen(false)}
      />

      <div
        id="page-wrap"
        className={`flex-grow flex flex-col pt-16 pl-6 transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="flex items-center justify-between w-full pr-8">
          <h1 className="text-4xl font-bold text-white pl-8">{title}</h1>
          <ProfileButton />
        </div>

        {children}
        <Footer />
      </div>
    </div>
  )
}

export default DashboardLayout
