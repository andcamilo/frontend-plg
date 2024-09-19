// utils/checkAuthToken.ts

import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

interface FirebaseToken {
  email: string;
  [key: string]: any;
}

export function checkAuthToken(): string | null {
  const authToken = Cookies.get('AuthToken'); // Retrieve the AuthToken from cookies

  if (!authToken) {
    return null;
  }

  try {
    // Decode the token without verifying the signature, as Firebase tokens have known structure
    const decodedToken = jwt.decode(authToken) as FirebaseToken;

    if (decodedToken && decodedToken.email) {
      return decodedToken.email;
    }

    return null; // No email found in the token
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
