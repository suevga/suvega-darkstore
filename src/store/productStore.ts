import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductProps } from '@/types/product';

export const useProductStore = create(
  persist<ProductProps>(
    set => ({
      products: [],
      totalProducts: 0,
      setProducts: products => set({ products }),
      setTotalProducts: count => set({ totalProducts: count }),
      clearProducts: () => set({ products: [] }),
    }),
    {
      name: 'product-store',
    }
  )
);
