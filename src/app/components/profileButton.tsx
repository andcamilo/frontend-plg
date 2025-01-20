import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/router"
import { auth } from "@configuration/firebase"
import cookie from "js-cookie"

const ProfileButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await auth.signOut()
      cookie.remove("AuthToken")
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleChangePassword = () => {
    console.log("Change password clicked")
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const user = auth.currentUser
  const initials = user?.email ? user.email.split("@")[0].slice(0, 2).toUpperCase() : "U"

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-gray-700 focus:outline-none"
      >
        {initials}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-[#1F1F2E] rounded-md shadow-lg z-10">
          <div className="py-1">
            <p className="px-4 py-2 text-sm text-white truncate">{user?.email}</p>
            <hr className="my-1" />
            <button
              onClick={() => router.push("/dashboard/account")}
              className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-100"
            >
              Mi cuenta
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfileButton

