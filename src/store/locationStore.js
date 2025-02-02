import { create } from 'zustand';
import { persist } from "zustand/middleware";

export const useLocationStore = create(
  persist(
    (set) => ({
      latitude: null,
      longitude: null,
      error: null,
      setLocation: (lat, lon) => set({ latitude: lat, longitude: lon, error: null }),
      setError: (error) => set({ error })
    }),
    {
      name: "location-store"
    }
  )
);
