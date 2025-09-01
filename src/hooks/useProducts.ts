import { useState, useEffect, useCallback } from 'react';
import { getAllProductsPaged as apiGetAllProductsPaged } from '../services/api';
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { darkstoreId } = useDarkStore();
  // Avoid using useBackend here to prevent global store updates causing rerender loops

  const fetchProducts = useCallback(async () => {
    if (!darkstoreId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiGetAllProductsPaged(page, 10, darkstoreId, undefined, 'published');

      console.log("getting all products in use products  hook::", response);
      
      const productsData = response?.data?.data?.products || [];
      const pagination = response?.data?.data?.pagination;
      
      // Transform products to simplified format for selection
      const transformedProducts: ProductOption[] = productsData.map((product: Product) => ({
        _id: product._id,
        name: product.productName,
        price: product.price,
        categoryName: typeof product.categoryId === 'object' 
          ? product.categoryId.categoryName 
          : product.category?.categoryName || 'Unknown Category'
      }));

      setProducts(prev => {
        if (page === 1) return transformedProducts;
        const existing = new Map(prev.map(p => [p._id, p]));
        for (const p of transformedProducts) existing.set(p._id, p);
        return Array.from(existing.values());
      });
      if (pagination) {
        setHasMore(pagination.currentPage < pagination.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [darkstoreId, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  return {
    products,
    loading,
    error,
    hasMore,
    loadMore,
    setPage,
    refetch: fetchProducts,
  };
};
