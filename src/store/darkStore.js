import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDarkStore = create(
  persist(
    (set) => ({
      isNewUser: true, // Assume new user by default
      darkstoreRegistered: false,
      registrationPending: false,
      darkstoreId: null,
      darkstoreDetails: {} || null,
      fcmToken: null,
      setIsNewUser: (isNew) => set({ isNewUser: isNew }),
      setDarkstoreRegistered: (registered) => set({ darkstoreRegistered: registered }),
      setRegistrationPending: (pending) => set({ registrationPending: pending }),
      setDarkstoreDetails: (details) => set({ darkstoreDetails: details }),
      setDarkstoreId: (id) => set({ darkstoreId: id }),
      setFcmToken: (token) => set({ fcmToken: token }),
      resetDarkstore: ()=> set({darkstoreId: null, darkstoreDetails: {}, darkstoreRegistered: false, registrationPending: false, fcmToken: null}) 
    }),
    {
      name: 'store-storage', // name of the item in the storage (must be unique)
    }
  )
)

