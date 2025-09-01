import { useMemo } from 'react';
import * as api from '../services/api';
import { toast } from './use-toast';

import { useDarkStore } from '../store/darkStore';
import useOrderStore from '../store/orderStore';
import { useProductStore } from '../store/productStore';
import { useCategoryStore } from '../store/categoryStore';
import { useUserStore } from '../store/allUsersStore';
import { useAllRiderStore } from '../store/allRiderStore';

/**
 * Centralized backend hook for production-ready API requests with
 * consistent error handling and automatic Zustand store integration.
 */
export const useBackend = () => {
  const darkStore = useDarkStore();
  const orderStore = useOrderStore();
  const productStore = useProductStore();
  const categoryStore = useCategoryStore();
  const userStore = useUserStore();
  const riderStore = useAllRiderStore();

  const handleError = (error: any, fallbackMessage: string) => {
    const message = error?.response?.data?.message || error?.message || fallbackMessage;
    toast({ title: 'Error', description: message, variant: 'destructive' });
  };

  return useMemo(
    () => ({
      // Store
      async checkStore(storename: string | null | undefined, email: string) {
        try {
          const res = await api.checkStore(storename, email);
          const data = res?.data?.data;
          if (data?.isRegistered && data?.storeDetails) {
            darkStore.setDarkstoreId(data.storeDetails._id);
            darkStore.setDarkstoreRegistered(true);
            darkStore.setDarkstoreDetails(data.storeDetails);
            if (typeof data.storeDetails.totalRevenue === 'number') {
              darkStore.setTotalRevenue(data.storeDetails.totalRevenue);
            }
          }
          return res;
        } catch (error) {
          handleError(error, 'Failed to verify store');
          throw error;
        }
      },
      async registerStore(
        storename: string | null | undefined,
        email: string,
        location: { latitude: number; longitude: number }
      ) {
        try {
          const res = await api.registerStore(storename, email, location);
          const data = res?.data?.data;
          if (data?._id) {
            darkStore.setDarkstoreId(data._id);
            darkStore.setDarkstoreRegistered(true);
            darkStore.setIsNewUser(false);
          }
          toast({ title: 'Registration complete' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to register store');
          throw error;
        }
      },
      async getStore(darkstoreId: string) {
        try {
          const res = await api.getStore(darkstoreId);
          const details = res?.data?.data;
          if (details) {
            darkStore.setDarkstoreDetails(details);
          }
          return res;
        } catch (error) {
          handleError(error, 'Failed to fetch store details');
          throw error;
        }
      },
      async updateStoreAddress(
        darkstoreId: string,
        address: { city: string; street: string; district: string; state: string; pincode?: string; pinCode?: string }
      ) {
        try {
          const res = await api.updateStoreAddress(darkstoreId, address);
          const updated = res?.data?.data?.updatedStore;
          if (updated) {
            darkStore.setDarkstoreDetails(updated);
          }
          toast({ title: 'Address updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to update address');
          throw error;
        }
      },

      // Orders
      async getOrders(darkstoreId: string, page = 1, limit = 10) {
        try {
          const res = await api.getOrders(darkstoreId, page, limit);
          const orders = res?.data?.data?.orders ?? [];
          if (Array.isArray(orders)) {
            orderStore.setOrders(
              [...orders].sort(
                (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
            );
            orderStore.setTotalOrderCount(res?.data?.data?.totalOrders || orders.length);
          }
          return res;
        } catch (error) {
          orderStore.setOrders([]);
          orderStore.setTotalOrderCount(0);
          handleError(error, 'Failed to fetch orders');
          throw error;
        }
      },
      async getOrderDetails(orderId: string) {
        try {
          return await api.getOrderDetails(orderId);
        } catch (error) {
          handleError(error, 'Failed to fetch order details');
          throw error;
        }
      },
      async updateOrderStatus(orderId: string, status: string) {
        try {
          const res = await api.updateOrderStatus(orderId, status);
          const updated = res?.data?.data?.order;
          if (updated) {
            orderStore.updateOrder(orderId, updated);
          }
          toast({ title: 'Order status updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to update order status');
          throw error;
        }
      },
      async storeRespondToOrder(orderId: string, accept: boolean) {
        try {
          const res = await api.storeRespondToOrder(orderId, accept);
          return res;
        } catch (error) {
          handleError(error, 'Failed to respond to order');
          throw error;
        }
      },
      async deleteOrderById(orderId: string) {
        try {
          const res = await api.deleteOrderById(orderId);
          orderStore.deleteOrder(orderId);
          toast({ title: 'Order deleted' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to delete order');
          throw error;
        }
      },

      // Users
      async getUsers(darkstoreId: string) {
        try {
          const res = await api.getUsers(darkstoreId);
          const users = res?.data?.data?.users ?? [];
          if (Array.isArray(users)) {
            userStore.setUsers(users);
          }
          return res;
        } catch (error) {
          handleError(error, 'Failed to fetch users');
          throw error;
        }
      },

      // Riders
      async getAllRiders(darkstoreId: string) {
        try {
          const res = await api.getAllRiders(darkstoreId);
          const riders = Array.isArray(res?.data)
            ? res.data
            : res?.data?.riders
              ? res.data.riders
              : [];
          riderStore.setAllRiders(riders);
          riderStore.setTotalRiders(riders.length);
          return res;
        } catch (error) {
          handleError(error, 'Failed to fetch riders');
          throw error;
        }
      },
      async verifyRider(riderId: string) {
        try {
          const res = await api.verifyRider(riderId);
          if (res?.status === 200) {
            const updated = riderStore.allRiders.map(r =>
              (r as any)._id === riderId ? { ...r, isApproved: true } : r
            );
            riderStore.setAllRiders(updated as any);
          }
          toast({ title: 'Rider verified' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to verify rider');
          throw error;
        }
      },
      async rejectRider(riderId: string, rejectionReason: string) {
        try {
          const res = await api.rejectRider(riderId, rejectionReason);
          if (res?.status === 200) {
            const rider = riderStore.allRiders.find(r => (r as any)._id === riderId);
            if (rider) {
              riderStore.addRejectedRider({ ...(rider as any), isRejected: true, rejectionReason });
            }
          }
          toast({ title: 'Rider rejected' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to reject rider');
          throw error;
        }
      },

      // Products
      // Removed deprecated getAdminProducts in favor of paginated fetch
      async getAllProductsPaged(
        page = 1,
        pageSize = 10,
        darkstoreId?: string,
        search?: string,
        status?: string
      ) {
        try {
          const res = await api.getAllProductsPaged(page, pageSize, darkstoreId, search, status);
          const data = res?.data?.data;
          console.log("products data in hook::", data);
          
          if (data?.products) {
            productStore.setProducts(data.products);
          }
          if (data?.pagination?.total) {
            productStore.setTotalProducts(data.pagination.total);
          }
          return res;
        } catch (error) {
          handleError(error, 'Failed to fetch products');
          throw error;
        }
      },
      async toggleProductStatus(productId: string, status: 'published' | 'private') {
        try {
          const res = await api.toggleProductStatus(productId, status);
          const updated = productStore.products.map(p =>
            (p as any)._id === productId ? { ...p, status } : p
          );
          productStore.setProducts(updated as any);
          toast({ title: 'Product status updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to toggle product status');
          throw error;
        }
      },
      async createProduct(formData: FormData, darkstoreId?: string) {
        try {
          const res = await api.createProduct(formData, darkstoreId);
          toast({ title: 'Product saved' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to save product');
          throw error;
        }
      },
      async updateProduct(formData: FormData, productId: string) {
        try {
          const res = await api.updateProduct(formData, productId);
          toast({ title: 'Product updated sucessfully' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to update product');
          throw error;
        }
      },
      async deleteProduct(productId: string) {
        try {
          const res = await api.deleteProduct(productId);
          if (res?.status === 200) {
            const next = productStore.products.filter(p => (p as any)._id !== productId);
            productStore.setProducts(next as any);
            productStore.setTotalProducts(Math.max(0, productStore.totalProducts - 1));
          }
          toast({ title: 'Product deleted' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to delete product');
          throw error;
        }
      },
      async getProductsByIds(productIds: string[]) {
        try {
          return await api.getProductsByIds(productIds);
        } catch (error) {
          handleError(error, 'Failed to fetch products by ids');
          throw error;
        }
      },

      // Categories
      async getCategories(
        page = 1,
        limit = 10,
        darkstoreId?: string,
        search?: string,
        status?: string
      ) {
        try {
          const res = await api.getCategories(page, limit, darkstoreId, search, status);
          const data = res?.data?.data;
          if (data?.categories) {
            categoryStore.setCategories(data.categories);
          }
          if (data?.pagination?.total) {
            categoryStore.setTotalCategoryCount(data.pagination.total);
          }
          return res;
        } catch (error) {
          handleError(error, 'Failed to fetch categories');
          throw error;
        }
      },
      async toggleCategoryStatus(categoryId: string, status: 'published' | 'private') {
        try {
          const res = await api.toggleCategoryStatus(categoryId, status);
          const updated = categoryStore.categories.map(c =>
            (c as any)._id === categoryId ? { ...c, status } : c
          );
          categoryStore.setCategories(updated as any);
          toast({ title: 'Category status updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to toggle category status');
          throw error;
        }
      },
      async addCategory(formData: FormData, darkstoreId?: string) {
        try {
          const res = await api.addCategory(formData, darkstoreId);
          toast({ title: 'Category saved' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to save category');
          throw error;
        }
      },
      async updateCategory(categoryId: string, formData: FormData) {
        try {
          const res = await api.updateCategory(categoryId, formData);
          toast({ title: 'Category updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to update category');
          throw error;
        }
      },
      async deleteCategory(categoryId: string) {
        try {
          const res = await api.deleteCategory(categoryId);
          if (res?.status === 200) {
            const next = categoryStore.categories.filter(c => (c as any)._id !== categoryId);
            categoryStore.setCategories(next as any);
            categoryStore.setTotalCategoryCount(Math.max(0, categoryStore.totalCategoryCount - 1));
          }
          toast({ title: 'Category deleted' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to delete category');
          throw error;
        }
      },

      // Inventory (proxy-only; store has its own actions today)
      async getLowStockProducts(storeId: string) {
        try {
          return await api.getLowStockProducts(storeId);
        } catch (error) {
          handleError(error, 'Failed to fetch low stock products');
          throw error;
        }
      },
      async getInventorySummary(storeId: string) {
        try {
          return await api.getInventorySummary(storeId);
        } catch (error) {
          handleError(error, 'Failed to fetch inventory summary');
          throw error;
        }
      },
      async updateInventory(productId: string, stock: number) {
        try {
          const res = await api.updateInventory(productId, stock);
          toast({ title: 'Inventory updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to update inventory');
          throw error;
        }
      },

      // Banners (no dedicated store; leave state to feature hook)
      async getStoreBanners(storeId: string) {
        try {
          return await api.getStoreBanners(storeId);
        } catch (error) {
          handleError(error, 'Failed to fetch banners');
          throw error;
        }
      },
      async createBanner(formData: FormData) {
        try {
          const res = await api.createBanner(formData);
          toast({ title: 'Banner created' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to create banner');
          throw error;
        }
      },
      async updateBannerStatus(bannerId: string, isActive: boolean) {
        try {
          const res = await api.updateBannerStatusApi(bannerId, isActive);
          toast({ title: 'Banner status updated' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to update banner status');
          throw error;
        }
      },
      async deleteBanner(bannerId: string) {
        try {
          const res = await api.deleteBannerApi(bannerId);
          toast({ title: 'Banner deleted' });
          return res;
        } catch (error) {
          handleError(error, 'Failed to delete banner');
          throw error;
        }
      },

      // Dashboard APIs
      async getDashboardMetrics(storeId: string, period = 'monthly') {
        try {
          return await api.getDashboardMetrics(storeId, period);
        } catch (error) {
          handleError(error, 'Failed to fetch dashboard metrics');
          throw error;
        }
      },

      async getTopSearchedProducts(storeId: string) {
        try {
          return await api.getTopSearchedProducts(storeId);
        } catch (error) {
          handleError(error, 'Failed to fetch top searched products');
          throw error;
        }
      },
    }),
    [darkStore, orderStore, productStore, categoryStore, userStore, riderStore]
  );
};

export type UseBackendReturn = ReturnType<typeof useBackend>;


