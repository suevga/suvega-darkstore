import { create } from "zustand";
import { persist } from "zustand/middleware";

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      setOrders: (orders) => set({ orders }),
      totalOrderCount: 0,
      setTotalOrderCount: (count) => set({ totalOrderCount: count }),
      
      // Add order
      addOrder: (order) => 
        set((state) => ({ 
          orders: [...state.orders, order],
          totalOrderCount: state.totalOrderCount + 1
        })),
      
      // Update order
      updateOrder: (orderId, updatedOrder) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order._id === orderId ? { ...order, ...updatedOrder } : order
          ),
        })),
      
      // Delete order
      deleteOrder: (orderId) =>
        set((state) => ({
          orders: state.orders.filter((order) => order._id !== orderId),
          totalOrderCount: state.totalOrderCount - 1
        })),

      // Get orders by status
      getOrdersByStatus: (status) => {
        const state = get();
        return state.orders.filter((order) => order.orderStatus === status);
      },

      // Get counts
      getOrderCounts: () => {
        const state = get();
        return state.orders.reduce((acc, order) => {
          if (order.orderStatus === 'delivered') acc.delivered++;
          if (order.orderStatus === 'cancelled') acc.cancelled++;
          return acc;
        }, { delivered: 0, cancelled: 0 });
      },

      // Clear orders
      clearOrders: () => set({ orders: [], totalOrderCount: 0 }),
    }),
    {
      name: "order-store",
    }
  )
);

export default useOrderStore;