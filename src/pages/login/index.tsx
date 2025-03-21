import React, { useState } from 'react';
import '@app/globals.css';
import Image from 'next/image';
import Logo from '@public/images/legix.png'; 
import { auth, signInWithEmailAndPassword } from '@configuration/firebase';
import errorMessages from './errorMessages.json';
import { FirebaseErrorMessages } from '@utils/types';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation"; 
import cookie from 'js-cookie';
import { Eye, EyeOff } from 'lucide-react';
import ResetPasswordModal from '@components/ResetPasswordModal'; // <-- Import your modal

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false); // new state

  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();

      cookie.set('AuthToken', idToken, { expires: 12 });
      setError(null);
      router.push('/dashboard/home');
    } catch (error: any) {
      console.error('Error logging in:', error);
      const errorCode: keyof FirebaseErrorMessages = error.code;
      const message = errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
      setError(message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Functions to open/close modal
  const openResetModal = () => setIsResetModalOpen(true);
  const closeResetModal = () => setIsResetModalOpen(false);

  return (
    <div className="flex flex-col min-h-screen md:flex-row">
      <div className="w-full md:w-1/2 min-h-screen bg-[#151521] flex flex-col justify-center items-center">
        <div className="text-center">
          <div className="flex flex-col items-start text-white mb-[20%]">
            <Image 
              src={Logo || "/placeholder.svg"} 
              alt="Logo" 
              width={210} 
              height={32} 
              className="mb-8" 
            /> 
            <p className='text-[#323232] font-bold text-2xl'>Ingresar</p>
            <p className='text-[#A8AEBB] font-semibold'>
              Inicie sesión con los datos que ingresó durante el registro.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Email"
                required
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-300" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-300" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="w-full p-3 rounded bg-profile text-white font-bold hover:bg-[#A00050] transition-colors"
            >
              Continuar
            </button>
          </form>

          {error && <p className="text-profile mt-4">{error}</p>}

          <div className="flex flex-col items-center mt-[10%]">
            <p className='text-[#A8AEBB]'>
              <span className='text-profile'>Crea una cuenta</span> al realizar tu primer trámite en línea.
            </p>
            {/* 
              Trigger the modal when the user clicks this:
            */}
            <p 
              className='text-profile cursor-pointer'
              onClick={openResetModal}
            >
              ¿Has olvidado tu contraseña?
            </p>
          </div>
        </div>
      </div>

      {/* Right half (gradient) */}
      <div className="w-1/2 bg-gradient-to-r from-[#151521] to-[#A00050] flex justify-center items-center">
        {/* Optional content or leave blank */}
      </div>

      {/* Render the Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={closeResetModal}
      />
    </div>
  );
};

export default Login;
