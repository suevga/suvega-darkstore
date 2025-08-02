export const envConfig = {
  backendUrl: String(import.meta.env.VITE_BASE_API_URL),
  socketUrl: String(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASE_API_URL),
  googleApiKey: String(import.meta.env.VITE_GOOGLE_API_KEY),
};
