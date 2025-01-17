import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set)=> ({
      users: [],
      setUsers: (users)=> set({users})
    }),
    {
      name: "user-store"
    }
  )
)
