import type React from "react"
import { useState } from "react"
import { getAuth, updatePassword } from "firebase/auth"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    try {
      const auth = getAuth()
      const user = auth.currentUser

      if (user) {
        await updatePassword(user, newPassword)
        alert("Contraseña actualizada exitosamente")
        onClose()
      } else {
        throw new Error("No se encontró usuario")
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error)
      setError("Error al cambiar la contraseña. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1c1c2b] p-8 rounded-lg max-w-md w-full">
        <h2 className="text-3xl font-bold mb-4">Cambiar Contraseña</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#2a2a3b] rounded p-2 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#2a2a3b] rounded p-2 text-white"
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-profile text-white px-4 py-2 rounded hover:bg-profile disabled:opacity-50"
            >
              {isLoading ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordModal

