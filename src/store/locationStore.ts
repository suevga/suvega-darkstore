import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LocationProps } from '@/types/location';

export const useLocationStore = create(
  persist<LocationProps>(
    (set) => ({
      latitude: 0,
      longitude: 0,
      error: null,
      setLocation: (lat, lon) => set({ latitude: lat, longitude: lon, error: null }),
      setError: error => set({ error }),
    }),
    {
      name: 'location-store',
    }
  )
);
