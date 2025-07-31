import { backendEnv } from "@utils/env";

const backendBaseUrl = "http://localhost:4000";

export const getNotifications = async (cuenta: string) => {
  let endpoint = `${backendBaseUrl}/${backendEnv}/notifications?cuenta=${cuenta}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Error fetching alerts: ${response.statusText}`);
  }
  return response.json();
};
