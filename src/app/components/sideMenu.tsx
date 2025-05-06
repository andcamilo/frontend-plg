"use client"
import React from "react"
import MenuIcon from "@mui/icons-material/Menu"
import "@app/globals.css"
import MenuComponent from "./menu"

interface SideMenuProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, setIsOpen }) => {
  const handleStateChange = (state: { isOpen: boolean }) => {
    setIsOpen(state.isOpen)
  }

  const closeMenu = () => setIsOpen(false)

  const showSettings = (event: React.MouseEvent) => {
    event.preventDefault()
    alert("Settings clicked!")
    closeMenu()
  }

  return (
    <>
      <MenuComponent
        menuOpen={isOpen}
        handleStateChange={handleStateChange}
        closeMenu={closeMenu}
        showSettings={showSettings}
      />

      <button
        className="fixed top-4 left-4 md:left-6 border-none bg-transparent cursor-pointer z-30"
        onClick={() => handleStateChange({ isOpen: !isOpen })}
      >
        <MenuIcon className="text-profile" />
      </button>
    </>
  )
}

export default SideMenu
