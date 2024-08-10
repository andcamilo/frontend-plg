import React from 'react';
import { auth } from '@configuration/firebase';
import { useRouter } from 'next/router';
import cookie from 'js-cookie';

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      cookie.remove('AuthToken');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-profile text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors"
    >
      SALIR
    </button>
  );
};

export default LogoutButton;
