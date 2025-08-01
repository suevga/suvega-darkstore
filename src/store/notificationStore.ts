import { create } from 'zustand';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  createdAt?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationStore>(set => ({
  notifications: [],
  addNotification: (notification) =>
    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 50),
    })),
  clearNotifications: () => set({ notifications: [] }),
  removeNotification: (id) =>
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
}));

export default useNotificationStore;
