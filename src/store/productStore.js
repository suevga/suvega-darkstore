import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProductStore = create(
  persist(
    (set)=> ({
      products: [],
      totalProducts:0,
      setProducts: (products)=> set({ products }),
      setTotalProducts: (count)=> set({ totalProducts: count }),
    })
  )
)