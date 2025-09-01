
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getAllProductsPaged as apiGetAllProductsPaged, getLowStockProducts as apiGetLowStockProducts, getInventorySummary as apiGetInventorySummary, updateInventory as apiUpdateInventory } from '../services/api';
import type { InventoryStoreProps } from '../types/inventory';
import type { Product } from '../types/product';

export const useInventoryStore = create(
  persist<InventoryStoreProps>(
    (set, get) => ({
      inventory: [],
      products: [],
      lowStockProducts: [],
      inventorySummary: null,
      loading: false,
      error: null,
      getInventory: async (storeId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await apiGetAllProductsPaged(1, 100, storeId, undefined, 'published');
          if (response.status === 200) {
            const productData: Product[] = response.data.data?.products || [];
            set({ products: productData });
          }
          set({ loading: false });
          return response.data;
        } catch (error: any) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error fetching products with inventory:', errMsg);
          set({
            error: errMsg || 'Failed to fetch products with inventory',
            loading: false,
          });
          return null;
        }
      },
      getLowStockProducts: async (storeId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await apiGetLowStockProducts(storeId);
          if (response.status === 200) {
            set({ lowStockProducts: response.data.data.products as Product[] });
          }
          set({ loading: false });
          return response.data;
        } catch (error: any) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error fetching low stock products:', errMsg);
          set({
            error: errMsg || 'Failed to fetch low stock products',
            loading: false,
          });
          return null;
        }
      },
      getInventorySummary: async (storeId: string) => {
        try {
          set({ loading: true, error: null });
          const response = await apiGetInventorySummary(storeId);
          if (response.status === 200) {
            set({ inventorySummary: response.data.data as any });
          }
          set({ loading: false });
          return response.data;
        } catch (error: any) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Error fetching inventory summary:', errMsg);
          set({
            error: errMsg || 'Failed to fetch inventory summary',
            loading: false,
          });
          return null;
        }
      },
      updateProductStock: async (productId: string, stock: number) => {
        try {
          set({ loading: true, error: null });
          const response = await apiUpdateInventory(productId, stock);
          if (response.status === 200) {
            // Refresh all data after updating
            const products = get().products as Product[];
            const storeId = products[0]?.storeId;
            if (storeId) {
              await get().getInventorySummary(storeId);
              await get().getLowStockProducts(storeId);
              await get().getInventory(storeId);
            }
          }
          set({ loading: false });
          return response.data;
        } catch (error: any) {
          console.error('Error updating product stock:', error);
          set({
            error: error?.response?.data?.message || 'Failed to update product stock',
            loading: false,
          });
          return null;
        }
      },
      resetInventory: () => {
        set({
          inventory: [],
          products: [],
          lowStockProducts: [],
          inventorySummary: null,
          loading: false,
          error: null,
        });
      },
    }),
    {
      name: 'inventory-store',
    }
  )
);
