// src/stores/notificationStore.js
import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications].slice(0, 50) // Keep last 50 notifications
    })),
  clearNotifications: () => set({ notifications: [] }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    }))
}));

export default useNotificationStore;