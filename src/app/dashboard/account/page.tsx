"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { checkAuthToken } from "@/src/app/utils/checkAuthToken"
import axios from "axios"
import ChangePasswordModal from "@components/ChangePasswordModal"
import { getRoleName } from "@/src/app/utils/roleSelector"
import { backendBaseUrl, backendEnv } from "@utils/env"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { uploadFile } from "@/src/app/utils/firebase-upload";
import Swal from 'sweetalert2';

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
    phone: "",
  })
  const [userRole, setUserRole] = useState("") // State for the role
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)
  const [userId, setUserId] = useState("")
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setProfilePhotoFile(file);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const tokenChecked = checkAuthToken()
        if (!tokenChecked?.user_id) {
          router.push("/login")
          return
        }
        console.log("🚀 ~ fetchUserData ~ user:", tokenChecked?.user_id)

        const response = await axios.get(`${backendBaseUrl}/${backendEnv}/get-user-id/${tokenChecked?.user_id}`)

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
    e.preventDefault();
    setIsLoading(true);

    try {
      const tokenChecked = checkAuthToken();
      if (!tokenChecked?.user_id) {
        throw new Error("User ID not found");
      }

      let profilePhotoUrl = "";

      if (profilePhotoFile) {
        profilePhotoUrl = await uploadFile(profilePhotoFile);
      }

      const updateData: any = {
        userId,
        nombre: formData.name,
        email: formData.email,
        telefonoSolicita: formData.phone,
      };

      if (profilePhotoUrl) {
        updateData.fotoPerfil = profilePhotoUrl; // ⬅️ Aquí mandamos la foto si existe
      }

      const response = await axios.post(`/api/update-user`, updateData,);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Perfil actualizado exitosamente",
          timer: 2500,
          showConfirmButton: false,
          background: '#2c2c3e',
          color: '#fff',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title-main',
            icon: 'custom-swal-icon',
            timerProgressBar: 'custom-swal-timer-bar'
          }
        }).then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al actualizar el perfil",
          timer: 2500,
          showConfirmButton: false,
          background: '#2c2c3e',
          color: '#fff',
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

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
    <>
      <div className="min-h-screen bg-[#151521] text-white p-8 w-fit">
        <h1 className="text-3xl font-bold mb-8">Usuario</h1>
        <div className="bg-[#1c1c2b] rounded-lg p-8 w-full max-w-7xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Datos básicos</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-fit">
              <div>
                <label className="block mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-fit min-w-[33ch] max-w-[50ch] bg-[#2a2a3b] rounded p-3 text-white block"

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
                  className="w-fit min-w-[33ch] max-w-[50ch] bg-[#2a2a3b] rounded p-3 text-white block"
                  required
                />
              </div>

              <div>
                <label className="block mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-fit min-w-[33ch] max-w-[50ch] bg-[#2a2a3b] rounded p-3 text-white block"
                />
              </div>

              <div>
                <label className="block mb-2">Rol</label>
                <input
                  type="text"
                  value={getRoleName(Number(userRole))}
                  readOnly
                  className="w-fit min-w-[33ch] max-w-[50ch] bg-[#2a2a3b] rounded p-3 text-white block cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Adjuntar Foto de Perfil</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="w-fit min-w-[33ch] max-w-[50ch] bg-[#2a2a3b] rounded p-3 text-white block"
              />
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
    </>
  )
}

export default AccountPage

