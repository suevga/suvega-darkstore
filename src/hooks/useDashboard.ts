import { useState, useEffect } from 'react';
import { useBackend } from './useBackend';
import { useDarkStore } from '../store/darkStore';
import { toast } from './use-toast';

/**
 * Dashboard metrics types based on the backend response
 */
export interface DashboardMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  totalProducts: number;
  totalCategories: number;
  orderStatusBreakdown: {
    completed: number;
    processing: number;
    cancelled: number;
    pending: number;
  };
  totalOrders: number;
  revenueTrend: Array<{ label: string; revenue: number }>;
  aovOverTime: Array<{ label: string; value: number }>;
  topProducts: Array<{
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  topCategories: Array<{
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  weeklyPerformance: Array<{
    day: string;
    orders: number;
    revenue: number;
  }>;
  platformDistribution: {
    web: number;
    ios: number;
    android: number;
  };
  customerAgeDistribution: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '55+': number;
  };
  searchTrends: {
    labels: string[];
    searches: number[];
    clicks: number[];
    conversions: number[];
  };
  kpis: {
    fulfillmentRate: { value: number; trend: string; target: number };
    customerSatisfaction: { value: number; trend: string; target: number };
    returnRate: { value: number; trend: string; target: number };
    cartAbandonmentRate: { value: number; trend: string; target: number };
    emailOpenRate: { value: number; trend: string; target: number };
    conversionRate: { value: number; trend: string; target: number };
    avgSessionDuration: { value: number; trend: string; target: number };
    customerRetention: { value: number; trend: string; target: number };
    inventoryTurnover: { value: number; trend: string; target: number };
  };
}

export interface TopSearchedProduct {
  product: string;
  searches: number;
  conversions: number;
  rate: number;
}

/**
 * Custom hook for fetching and managing dashboard metrics
 */
export const useDashboard = () => {
  const { getDashboardMetrics, getTopSearchedProducts } = useBackend();
  const { darkstoreId, setTotalRevenue } = useDarkStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topSearched, setTopSearched] = useState<TopSearchedProduct[]>([]);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');

  const fetchDashboardMetrics = async () => {
    if (!darkstoreId) {
      setError('No store ID available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await getDashboardMetrics(darkstoreId, period);
      const data = response?.data?.data;
      
      if (data) {
        setMetrics(data);
        
        // Update total revenue in the store
        if (typeof data.totalRevenue === 'number') {
          setTotalRevenue(data.totalRevenue);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch dashboard metrics');
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard metrics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTopSearchedProducts = async () => {
    if (!darkstoreId) return;

    try {
      const response = await getTopSearchedProducts(darkstoreId);
      const data = response?.data?.data;
      
      if (data && Array.isArray(data)) {
        setTopSearched(data);
      }
    } catch (err) {
      console.error('Failed to fetch top searched products:', err);
    }
  };

  useEffect(() => {
    if (darkstoreId) {
      fetchDashboardMetrics();
      fetchTopSearchedProducts();
    }
  }, [darkstoreId, period]);

  return {
    metrics,
    topSearched,
    loading,
    error,
    period,
    setPeriod,
    refreshMetrics: fetchDashboardMetrics,
  };
};