import { useState, useEffect, useCallback } from 'react';
import { getCategories as apiGetCategories } from '../services/api';
import { useDarkStore } from '../store/darkStore';

export interface CategoryOption {
  _id: string;
  name: string;
  productCount: number;
  status: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { darkstoreId } = useDarkStore();
  // Avoid using useBackend here to prevent global store updates causing rerender loops

  const fetchCategories = useCallback(async () => {
    if (!darkstoreId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all categories (published only for banners)
      const response = await apiGetCategories(1, 100, darkstoreId, undefined, 'published');
      const categoriesData = response?.data?.data?.categories || [];
      
      // Transform categories to simplified format for selection
      const transformedCategories: CategoryOption[] = categoriesData.map((category: any) => ({
        _id: category._id,
        name: category.categoryName,
        productCount: category.productCount || 0,
        status: category.status,
      }));

      setCategories(transformedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [darkstoreId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};
