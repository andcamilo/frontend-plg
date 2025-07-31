import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

interface FirebaseToken {
  email: string;
  user_id: string;
  [key: string]: any;
}

export function decodeUserToken(): { email: string; user_id: string } {
  const authToken = Cookies.get("AuthToken");

  if (!authToken) {
    throw new Error("No se encontró el token de autenticación");
  }

  const decodedToken = jwt.decode(authToken) as FirebaseToken;

  return {
    email: decodedToken.email,
    user_id: decodedToken.user_id,
  };
}
