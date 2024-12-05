import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUserStore = create(
  persist(
    (set) => ({
      isNewUser: true, // Assume new user by default
      darkstoreRegistered: false,
      registrationPending: false,
      darkstoreId: null,
      setIsNewUser: (isNew) => set({ isNewUser: isNew }),
      setDarkstoreRegistered: (registered) => set({ darkstoreRegistered: registered }),
      setRegistrationPending: (pending) => set({ registrationPending: pending }),
      setDarkstoreId: (id) => set({ darkstoreId: id }),
    }),
    {
      name: 'user-storage', // name of the item in the storage (must be unique)
    }
  )
)

