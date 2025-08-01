import { UserProps } from '@/types/users';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist<UserProps>(
    set=> ({
      users: [],
      setUsers: (users) => set({ users }),
      clearUsers: () => set({ users: [] }),
    }),
    {
      name: 'user-store',
    }
  )
);
