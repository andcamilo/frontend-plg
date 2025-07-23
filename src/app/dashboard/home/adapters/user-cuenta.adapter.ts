import { User } from "../types/user-cuenta.types";

export const userCuentaAdapter = (response: any): User => {
  return {
    rol: response?.solicitud?.rol ?? 0,
  };
};
