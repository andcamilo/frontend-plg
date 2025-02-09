import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';
import axios from 'axios';

interface FirebaseToken {
  user_id: string;
  email?: string;
  cuenta?: string;
  nombre?: string;
  rol?: string;
  status?: string;
}

export async function checkAuthToken(): Promise<{ email: string; user_id: string; cuenta?: string; nombre?: string; rol?: string; status?: string } | null> {
  const authToken = Cookies.get('AuthToken'); 

  if (!authToken) {
    console.error("❌ No se encontró ningún token en las cookies.");
    return null;
  }

  try {
    const decodedToken = jwt.decode(authToken) as FirebaseToken;

    console.log("✅ Token decodificado:", decodedToken);

    if (!decodedToken || !decodedToken.email) {
      console.error("❌ El token es inválido o no tiene un email.");
      return null;
    }

    console.log("📧 Email extraído del token:", decodedToken.email);

    // Hacer la solicitud a la API
    const userResponse = await axios.post('/api/get-user-email', {
      userEmail: decodedToken.email,
    });

    console.log("✅ Respuesta de la API:", userResponse.data);

    const userData = userResponse.data;

    return {
      email: decodedToken.email,
      user_id: userData.id ,
      cuenta: userData.cuenta ?? null,
      nombre: userData.nombre ?? null,
      rol: userData.rol ?? null,
      status: userData.status ?? null,
    };

  } catch (error: any) {
    console.error("❌ Error en `checkAuthToken`:", error.message);
    console.error("📡 Respuesta del servidor:", error.response?.data || "No hay respuesta");
    return null;
  }
}

