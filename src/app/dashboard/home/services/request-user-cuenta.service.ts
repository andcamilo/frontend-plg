import { userCuentaAdapter } from "../adapters/user-cuenta.adapter";

export const fetchUser = async (userCuenta: string) => {
  const endpoint = `/api/get-user-cuenta?userCuenta=${encodeURIComponent(
    userCuenta
  )}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching user cuenta: ${response.statusText}`);
  }

  const user = await response.json();

  return userCuentaAdapter(user);
};
