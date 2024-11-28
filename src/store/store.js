import { create } from 'zustand'

export const useLocationStore = create((set) => ({
  latitude: null,
  longitude: null,
  setLocation: (lat, lon) => set({ latitude: lat, longitude: lon }),
}))

