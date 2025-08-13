import { useState, useEffect, useCallback } from 'react';
import { useBackend } from './useBackend';
import { useDarkStore } from '../store/darkStore';
import type { Product } from '../types/product';

export interface ProductOption {
  _id: string;
  name: string;
  price: number;
  categoryName?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { darkstoreId } = useDarkStore();
  const api = useBackend();

  const fetchProducts = useCallback(async () => {
    if (!darkstoreId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.getAdminProducts(darkstoreId);
      const productsData = response?.data?.data?.products || [];
      
      // Transform products to simplified format for selection
      const transformedProducts: ProductOption[] = productsData.map((product: Product) => ({
        _id: product._id,
        name: product.productName,
        price: product.price,
        categoryName: typeof product.categoryId === 'object' 
          ? product.categoryId.categoryName 
          : product.category?.categoryName || 'Unknown Category'
      }));

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [darkstoreId, api]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};
