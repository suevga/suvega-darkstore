import { create } from 'zustand';

export const useLocationStore = create((set) => ({
  latitude: null,
  longitude: null,
  error: null,
  setLocation: (lat, lon) => set({ latitude: lat, longitude: lon, error: null }),
  requestLocation: async () => {
    try {
      // Requesting user's current location from the browser.
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          set({
            latitude: coords.latitude,
            longitude: coords.longitude,
            error: null,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          set({ error: error.message });
        }
      );
    } catch (err) {
      console.error('Unexpected error during location request:', err);
      set({ error: 'Unexpected error occurred.' });
    }
  },
  
}));
