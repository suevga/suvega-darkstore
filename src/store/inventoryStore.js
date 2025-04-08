import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosInstance from "../api/axiosInstance.js";

export const useInventoryStore = create(
  persist(
    (set, get) => ({
      inventory: [],
      products: [],
      lowStockProducts: [],
      inventorySummary: null,
      loading: false,
      error: null,

      // Fetch inventory for all products in a store
      getInventory: async (storeId) => {
        try {
          set({ loading: true, error: null });
          // Get product data from the product API
          const response = await axiosInstance.get(`/api/v1/product/get-admin-products/${storeId}`);
          if (response.status === 200) {
            const productData = response.data.data?.products || [];
            set({ products: productData });
          }
          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error("Error fetching products with inventory:", error);
          set({ 
            error: error.response?.data?.message || "Failed to fetch products with inventory", 
            loading: false 
          });
          return null;
        }
      },

      // Fetch low stock products for a store
      getLowStockProducts: async (storeId) => {
        try {
          set({ loading: true, error: null });
          const response = await axiosInstance.get(`/api/v1/inventory/get-low-stock-products/${storeId}`);
          if (response.status === 200) {
            set({ lowStockProducts: response.data.data.products });
          }
          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error("Error fetching low stock products:", error);
          set({ 
            error: error.response?.data?.message || "Failed to fetch low stock products", 
            loading: false 
          });
          return null;
        }
      },

      // Fetch inventory summary for a store
      getInventorySummary: async (storeId) => {
        try {
          set({ loading: true, error: null });
          const response = await axiosInstance.get(`/api/v1/inventory/get-inventory-summary/${storeId}`);
          if (response.status === 200) {
            set({ inventorySummary: response.data.data });
          }
          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error("Error fetching inventory summary:", error);
          set({ 
            error: error.response?.data?.message || "Failed to fetch inventory summary", 
            loading: false 
          });
          return null;
        }
      },

      // Update product inventory
      updateProductStock: async (productId, stock) => {
        try {
          set({ loading: true, error: null });
          const response = await axiosInstance.put(`/api/v1/inventory/${productId}`, {
            stock
          });
          
          if (response.status === 200) {
            // Refresh all data after updating
            const storeId = get().products[0]?.storeId;
            if (storeId) {
              await get().getInventorySummary(storeId);
              await get().getLowStockProducts(storeId);
              await get().getInventory(storeId);
            }
          }
          
          set({ loading: false });
          return response.data;
        } catch (error) {
          console.error("Error updating product stock:", error);
          set({ 
            error: error.response?.data?.message || "Failed to update product stock", 
            loading: false 
          });
          return null;
        }
      },

      // Reset the store state
      resetInventory: () => {
        set({
          inventory: [],
          products: [],
          lowStockProducts: [],
          inventorySummary: null,
          loading: false,
          error: null
        });
      }
    }),
    {
      name: "inventory-store"
    }
  )
); 