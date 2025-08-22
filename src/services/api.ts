import axiosInstance from '../api/axiosInstance';

// Store APIs
export const checkStore = async (storename: string | null | undefined, email: string) => {
  return axiosInstance.post('/api/v1/store/check', { storename, email });
};

export const registerStore = async (
  storename: string | null | undefined,
  email: string,
  location: { latitude: number; longitude: number }
) => {
  return axiosInstance.post('/api/v1/store/register', { storename, email, location });
};

export const getStore = async (darkstoreId: string) => {
  return axiosInstance.get(`/api/v1/store/getStore/${darkstoreId}`);
};

export const updateStoreAddress = async (
  darkstoreId: string,
  address: { city: string; street: string; district: string; state: string; pincode?: string; pinCode?: string }
) => {
  return axiosInstance.patch(`/api/v1/store/updateAddress/${darkstoreId}`, { address });
};

// Orders APIs
export const getOrders = async (darkstoreId: string, page = 1, limit = 10) => {
  return axiosInstance.get(`/api/v1/order/allorders/${darkstoreId}?page=${page}&limit=${limit}`);
};

export const getOrderDetails = async (orderId: string) => {
  return axiosInstance.get(`/api/v1/order/details/${orderId}`);
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  return axiosInstance.patch(`/api/v1/order/status/${orderId}`, { status });
};

export const storeRespondToOrder = async (orderId: string, accept: boolean) => {
  return axiosInstance.patch(`/api/v1/order/store-response/${orderId}`, { accept });
};

export const deleteOrderById = async (orderId: string) => {
  return axiosInstance.delete(`/api/v1/order/delete-order/${orderId}`);
};

// Users APIs
export const getUsers = async (darkstoreId: string) => {
  return axiosInstance.get(`/api/v1/users/userlists/${darkstoreId}`);
};

// Riders APIs
export const getAllRiders = async (darkstoreId: string) => {
  return axiosInstance.get(`/api/v1/rider/get-all-riders/${darkstoreId}`);
};

export const verifyRider = async (riderId: string) => {
  return axiosInstance.patch(`/api/v1/rider/verify/${riderId}`, { isApproved: true });
};

export const rejectRider = async (riderId: string, rejectionReason: string) => {
  return axiosInstance.post(`/api/v1/rider/reject/${riderId}`, {
    isRejected: true,
    rejectionReason,
  });
};

// Products APIs
export const getAdminProducts = async (storeId: string) => {
  // Get all products for a store
  return axiosInstance.get(`/api/v1/product/admin/getAdminAllProduct/${storeId}`);
};

export const getAllProductsPaged = async (
  page = 1,
  pageSize = 10,
  darkstoreId?: string,
  search?: string,
  status?: string
) => {
  const params: Record<string, any> = { page, limit: pageSize };
  if (darkstoreId) params.darkStoreId = darkstoreId;
  if (search) params.search = search;
  if (status && status !== 'all') params.status = status;
  return axiosInstance.get('/api/v1/product/admin/getAllProduct', { params });
};

export const toggleProductStatus = async (productId: string, status: 'published' | 'private') => {
  return axiosInstance.patch(`/api/v1/product/admin/product/${productId}`, { status });
};

export const createProduct = async (formData: FormData, darkstoreId?: string) => {
  return axiosInstance.post('/api/v1/product/admin/createProduct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { darkstoreId },
  });
};

export const deleteProduct = async (productId: string) => {
  return axiosInstance.delete(`/api/v1/product/admin/product/${productId}`);
};

export const getProductsByIds = async (productIds: string[]) => {
  return axiosInstance.post('/api/v1/product/get-products-by-ids', { productIds });
};

// Categories APIs
export const getCategories = async (
  page = 1,
  limit = 10,
  darkstoreId?: string,
  search?: string,
  status?: string
) => {
  const params: Record<string, any> = { page, limit };
  if (darkstoreId) params.darkStoreId = darkstoreId;
  if (search) params.search = search;
  if (status && status !== 'all') params.status = status;
  return axiosInstance.get('/api/v1/category/admin/getcategories', { params });
};

export const toggleCategoryStatus = async (categoryId: string, status: 'published' | 'private') => {
  return axiosInstance.patch(`/api/v1/category/admin/category/${categoryId}`, { status });
};

export const addCategory = async (formData: FormData, darkstoreId?: string) => {
  return axiosInstance.post('/api/v1/category/admin/addcategory', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    params: { darkstoreId },
  });
};

export const deleteCategory = async (categoryId: string) => {
  return axiosInstance.delete(`/api/v1/category/admin/category/${categoryId}`);
};

// Update category (name/description/status/image)
export const updateCategory = async (categoryId: string, formData: FormData) => {
  return axiosInstance.patch(`/api/v1/category/admin/category/${categoryId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// Inventory APIs
export const getLowStockProducts = async (storeId: string) => {
  return axiosInstance.get(`/api/v1/inventory/get-low-stock-products/${storeId}`);
};

export const getInventorySummary = async (storeId: string) => {
  return axiosInstance.get(`/api/v1/inventory/get-inventory-summary/${storeId}`);
};

export const updateInventory = async (productId: string, stock: number) => {
  return axiosInstance.put(`/api/v1/inventory/${productId}`, { stock });
};

// Banners APIs
export const getStoreBanners = async (storeId: string) => {
  return axiosInstance.get(`/api/v1/banner/get-stores-banners/${storeId}`);
};

export const createBanner = async (formData: FormData) => {
  return axiosInstance.post('/api/v1/banner/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateBannerStatusApi = async (bannerId: string, isActive: boolean) => {
  return axiosInstance.put(`/api/v1/banner/update-status/${bannerId}`, { isActive });
};

export const deleteBannerApi = async (bannerId: string) => {
  return axiosInstance.delete(`/api/v1/banner/delete-banner/${bannerId}`);
};

// Dashboard APIs
export const getDashboardMetrics = async (storeId: string, period = 'monthly') => {
  return axiosInstance.get(`/api/v1/dashboard/${storeId}/metrics?period=${period}`);
};

export const getTopSearchedProducts = async (storeId: string) => {
  return axiosInstance.get(`/api/v1/dashboard/${storeId}/top-searches`);
};


