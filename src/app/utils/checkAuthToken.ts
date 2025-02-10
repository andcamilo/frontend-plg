import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

interface FirebaseToken {
  email: string;
  user_id: string;
  [key: string]: any;
}

export function checkAuthToken(): { email: string; user_id: string } | null {
  const authToken = Cookies.get('AuthToken'); // Recuperar el token desde las cookies

  if (!authToken) {
    return null;
  }

  try {
    // Decodificar el token sin verificar la firma
    const decodedToken = jwt.decode(authToken) as FirebaseToken;
    console.log("Datos decodificados del token:", decodedToken);

    if (decodedToken && decodedToken.email && decodedToken.user_id) {
      return {
        email: decodedToken.email,
        user_id: decodedToken.user_id,
      };
    }

    return null; // Si falta alguno de los datos
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}