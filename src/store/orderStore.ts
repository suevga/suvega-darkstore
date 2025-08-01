import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { OrderStoreProps } from '@/types/orders';

const useOrderStore = create(
  persist<OrderStoreProps>(
    (set, get) => ({
      orders: [],
      setOrders: (orders) => {
        set({
          orders,
          totalOrderCount: orders.length,
        });
      },
      totalOrderCount: 0,
      setTotalOrderCount: (count) => set({ totalOrderCount: count }),
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
          totalOrderCount: state.totalOrderCount + 1,
        })),
      updateOrder: (orderId, updatedOrder) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === orderId ? { ...order, ...updatedOrder } : order
          ),
        })),
      deleteOrder: (orderId) =>
        set((state) => {
          const newOrders = state.orders.filter((order) => order._id !== orderId);
          return {
            orders: newOrders,
            totalOrderCount: newOrders.length,
          };
        }),
      getOrdersByStatus: (status) => {
        const state = get();
        return state.orders.filter((order) => order.orderStatus === status);
      },
      getOrderCounts: () => {
        const state = get();
        return state.orders.reduce(
          (acc, order) => {
            if (order.orderStatus === 'delivered') acc.delivered++;
            if (order.orderStatus === 'rejected') acc.rejected++;
            if (order.orderStatus === 'cancelled') acc.cancelled++;
            return acc;
          },
          { delivered: 0, rejected: 0, cancelled: 0 }
        );
      },
      clearOrders: () => set({ orders: [], totalOrderCount: 0 }),
    }),
    {
      name: 'order-store',
    }
  )
);

export default useOrderStore;
