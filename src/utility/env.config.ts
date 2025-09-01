export const envConfig = {
  backendUrl: String(import.meta.env.VITE_BASE_API_URL),
  socketUrl: String(import.meta.env.VITE_BASE_API_URL),
  googleApiKey: String(import.meta.env.VITE_GOOGLE_API_KEY),
  clerkTestPublishableKey: String(import.meta.env.VITE_CLERK_TEST_PUBLISHABLE_KEY),
  clerkPublishableKey: String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY),
};
