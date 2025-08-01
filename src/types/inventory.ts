
import type { Product } from './product';

export interface InventoryItem {
  _id: string;
  productId: string;
  storeId: string;
  stock: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface InventorySummary {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  inStockCount: number;
  productsWithInventory: number;
  inventoryStatus: {
    outOfStock: number;
    lowStock: number;
    inStock: number;
  };
  percentages: {
    outOfStock: number;
    lowStock: number;
    inStock: number;
  };
  totalInventoryValue: number;
  recentLowStockAlerts: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    minimumStock: number;
    alertDate: Date;
  }>;
}

export interface InventoryStoreProps {
  inventory: InventoryItem[];
  products: Product[];
  lowStockProducts: Product[];
  inventorySummary: InventorySummary | null;
  loading: boolean;
  error: string | null;
  getInventory: (storeId: string) => Promise<any>;
  getLowStockProducts: (storeId: string) => Promise<any>;
  getInventorySummary: (storeId: string) => Promise<any>;
  updateProductStock: (productId: string, stock: number) => Promise<any>;
  resetInventory: () => void;
}
