import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCategoryStore = create(
    persist(
        (set) => ({
            categories: [],
            setCategories: (categories) => set({ categories }),
            totalCategoryCount: 0,
            setTotalCategoryCount: (count) => set({ totalCategoryCount: count }),
            clearCategories: () => set({ categories: [] }),
        }),
        {
           name: "category-store" 
        }
    )
)