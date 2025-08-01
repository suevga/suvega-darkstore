import { RiderProps } from '@/types/rider';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAllRiderStore = create(
  persist<RiderProps>(
    (set, get) => ({
      allRiders: [],
      totalRiders: 0,
      rejectedRiders: [],
      setAllRiders: riders => set({ allRiders: riders }),
      setTotalRiders: total => set({ totalRiders: total }),
      resetAllRiders: () => set({ allRiders: [], totalRiders: 0, rejectedRiders: [] }),

      // Add a rider to the rejected list and remove from active riders
      addRejectedRider: rider => {
        set(state => {
          // Filter out the rejected rider from allRiders
          const updatedRiders = state.allRiders.filter(r => r._id !== rider._id);

          // Add the rider to rejected riders if not already there
          const isAlreadyRejected = state.rejectedRiders.some(r => r._id === rider._id);
          const updatedRejectedRiders = isAlreadyRejected
            ? state.rejectedRiders
            : [...state.rejectedRiders, rider];

          return {
            allRiders: updatedRiders,
            rejectedRiders: updatedRejectedRiders,
            totalRiders: updatedRiders.length,
          };
        });
      },

      // Get count of rejected riders
      getRejectedCount: () => get().rejectedRiders.length,
    }),
    {
      name: 'all-riders',
    }
  )
);
