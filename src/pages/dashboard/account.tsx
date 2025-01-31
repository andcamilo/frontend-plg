import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import DashboardLayout from "@components/dashboardLayout"
import { checkAuthToken } from "@/src/app/utils/checkAuthToken"
import axios from "axios"
import ChangePasswordModal from "@components/ChangePasswordModal"
import { getRoleName } from "@/src/app/utils/roleSelector"

interface UserData {
  id: string
  nombre: string
  email: string
  telefono?: string
  rol: string // Added "rol" property
}

const AccountPage: React.FC = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  })
  const [userRole, setUserRole] = useState("") // State for the role
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false) 
  const [userId, setUserId] = useState("") 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenChecked = checkAuthToken()
        if (!tokenChecked?.user_id) {
          router.push("/login")
          return
        }
        console.log("🚀 ~ fetchUserData ~ user:", tokenChecked?.user_id)

        const response = await axios.get(
          `https://7hzt4b9tck.execute-api.us-east-1.amazonaws.com/dev/get-user-id/${tokenChecked?.user_id}`,
        )

        console.log("🚀 ~ fetchUserData ~ response:", response)

        if (response.status !== 200) {
          throw new Error("Failed to fetch user data")
        }

        const userData = response.data.user

        setUserId(userData.id)
        setUserRole(userData.rol || "") // Set user role

        setFormData((prev) => ({
          ...prev,
          name: userData.nombre || "",
          email: userData.email || "",
          phone: userData.telefonoSolicita || "",
        }))
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const tokenChecked = checkAuthToken()
      if (!tokenChecked?.user_id) {
        throw new Error("User ID not found")
      }

      const updateData = {
        nombre: formData.name,
        email: formData.email,
        telefonoSolicita: formData.phone,
      }

      const response = await axios.patch(
        `https://7hzt4b9tck.execute-api.us-east-1.amazonaws.com/dev/update-user/${userId}`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      if (response.status === 200) {
        alert("Perfil actualizado exitosamente")
      } else {
        throw new Error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error al actualizar el perfil: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        profilePhoto: e.target.files![0],
      }))
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#151521] text-white flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <DashboardLayout title="Mi Cuenta">
      <div className="min-h-screen bg-[#151521] text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Usuario</h1>

        <div className="bg-[#1c1c2b] rounded-lg p-8 max-w-4xl">
          <h2 className="text-xl font-bold mb-6">Datos básicos</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#2a2a3b] rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-contain bg-[#2a2a3b] rounded p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-[#2a2a3b] rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block mb-2">Rol</label>
                <input
                  type="text"
                  value={getRoleName(Number(userRole))}
                  readOnly
                  className="w-full bg-[#2a2a3b] rounded p-2 text-white cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="button"
              className="bg-[#2a2a3b] text-white px-6 py-2 rounded hover:bg-[#3a3a4b]"
              onClick={() => setIsChangePasswordModalOpen(true)}
            >
              Cambiar Contraseña
            </button>

            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
              >
                Volver
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-profile text-white px-6 py-2 rounded hover:bg-profile disabled:opacity-50"
              >
                {isLoading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setIsChangePasswordModalOpen(false)} />
    </DashboardLayout>
  )
}

export default AccountPage
