export const envConfig = {
  firebaseApiKey: String(import.meta.env.VITE_FIREBASE_API_KEY),
  firebaseAuthDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  firebaseProjectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  firebaseStorageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  firebaseMessagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  firebaseAppId: String(import.meta.env.VITE_FIREBASE_APP_ID),
  firebaseMeasurementId: String(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
  firebaseVAPID: String(import.meta.env.VITE_FIREBASE_VAPID_KEY),
  backendUrl: String(import.meta.env.VITE_BASE_API_URL),
  socketUrl: String(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BASE_API_URL),
  googleApiKey: String(import.meta.env.VITE_GOOGLE_API_KEY)
}