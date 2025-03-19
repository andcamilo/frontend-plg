import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@configuration/firebase'; 

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage(`Se ha enviado un enlace de recuperación a ${email}.`);
      setEmail('');
    } catch (err: any) {
      console.error(err);
      setError('No se pudo enviar el correo de recuperación. Verifique el email ingresado.');
    }
  };

  if (!isOpen) {
    return null; 
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Restablecer contraseña</h2>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label htmlFor="resetEmail" className="block mb-1">Email</label>
            <input
              id="resetEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Ingresa tu email registrado"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-2 rounded bg-profile text-white font-bold hover:bg-[#A00050] transition-colors"
          >
            Enviar enlace de recuperación
          </button>
        </form>

        {message && <p className="text-green-600 mt-4">{message}</p>}
        {error && <p className="text-red-600 mt-4">{error}</p>}

        <button
          onClick={onClose}
          className="mt-4 underline"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
