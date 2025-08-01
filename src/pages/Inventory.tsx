import { useEffect, useState, useMemo } from 'react';
import { Search, Package, AlertCircle, BarChart, PlusCircle, Loader2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useInventoryStore } from '../store/inventoryStore';
import { useDarkStore } from '../store/darkStore';

import { toast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { darkstoreId } = useDarkStore();
  const {
    lowStockProducts,
    inventorySummary,
    products,
    loading,
    error,
    getLowStockProducts,
    getInventorySummary,
    getInventory,
    updateProductStock,
  } = useInventoryStore();
  const [activeTab, setActiveTab] = useState('all-products');
  const [editingStock, setEditingStock] = useState<any>(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch inventory data when component mounts
    const fetchInventoryData = async () => {
      try {
        if (darkstoreId) {
          await Promise.all([
            getLowStockProducts(darkstoreId),
            getInventorySummary(darkstoreId),
            getInventory(darkstoreId),
          ]);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch inventory data. Please try again.',
          variant: 'destructive',
        });
      }
    };

    if (darkstoreId) {
      fetchInventoryData();
    }
  }, [darkstoreId, getLowStockProducts, getInventorySummary, getInventory]);

  // Filter products based on search term and active tab
  const filteredLowStock =
    lowStockProducts?.filter(item => {
      const productName = item.product?.productName?.toLowerCase() || '';
      const matchesSearch = productName.includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === 'low-stock' ||
        (activeTab === 'out-of-stock' && item.stockStatus === 'Out of Stock') ||
        (activeTab === 'low-stock-only' && item.stockStatus === 'Low Stock');

      return matchesSearch && matchesTab;
    }) || [];

  // Filter all products based on search term
  const filteredProducts =
    products?.filter(product => {
      return product.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Analytics data
  const stockDistributionData = useMemo(() => {
    if (!inventorySummary) return [];
    return [
      { name: 'In Stock', value: inventorySummary.inventoryStatus.inStock, fill: '#10b981' },
      { name: 'Low Stock', value: inventorySummary.inventoryStatus.lowStock, fill: '#f59e0b' },
      { name: 'Out of Stock', value: inventorySummary.inventoryStatus.outOfStock, fill: '#ef4444' },
    ];
  }, [inventorySummary]);

  const topProductsByValue = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products
      .map(product => ({
        name: product.productName.length > 15 
          ? product.productName.substring(0, 15) + '...' 
          : product.productName,
        value: (product.discountPrice || product.price || 0) * product.quantity,
        quantity: product.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [products]);

  const categoryStockDistribution = useMemo(() => {
    if (!products || products.length === 0) return [];
    const categoryStock = {};
    products.forEach(product => {
      const categoryName = typeof product.categoryId === 'object' 
        ? product.categoryId?.categoryName || 'Uncategorized'
        : 'Uncategorized';
      
      if (!categoryStock[categoryName]) {
        categoryStock[categoryName] = { totalStock: 0, totalValue: 0 };
      }
      categoryStock[categoryName].totalStock += product.quantity;
      categoryStock[categoryName].totalValue += (product.discountPrice || product.price || 0) * product.quantity;
    });
    
    return Object.entries(categoryStock)
      .map(([category, data]: [string, any]) => ({
        category: category.length > 12 ? category.substring(0, 12) + '...' : category,
        stock: data.totalStock,
        value: data.totalValue
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 6);
  }, [products]);

  const lowStockTrend = useMemo(() => {
    if (!lowStockProducts || lowStockProducts.length === 0) return [];
    
    // Group by stock status
    const statusCounts = {
      'Critical (0-5)': 0,
      'Low (6-15)': 0,
      'Moderate (16-25)': 0,
      'Good (26+)': 0
    };
    
    products.forEach(product => {
      const stock = product.quantity;
      if (stock <= 5) statusCounts['Critical (0-5)']++;
      else if (stock <= 15) statusCounts['Low (6-15)']++;
      else if (stock <= 25) statusCounts['Moderate (16-25)']++;
      else statusCounts['Good (26+)']++;
    });
    
    return Object.entries(statusCounts).map(([range, count]) => ({
      range,
      count
    }));
  }, [products, lowStockProducts]);

  // Handle stock update
  const handleStockUpdate = async () => {
    if (
      !editingStock ||
      newStockValue === '' ||
      isNaN(Number(newStockValue)) ||
      Number(newStockValue) < 0
    ) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a valid stock quantity (non-negative number).',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await updateProductStock(editingStock._id, parseInt(newStockValue));

      if (response) {
        toast({
          title: 'Stock updated',
          description: `${editingStock.productName} stock has been updated to ${newStockValue}.`,
          variant: 'default',
        });

        // Reset state
        setEditingStock(null);
        setNewStockValue('');
        setEditDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update stock. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-3xl font-bold">Inventory Management</h1>

      {/* Stats Cards */}
      {loading && !inventorySummary ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : inventorySummary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {inventorySummary.productsWithInventory} with inventory tracking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventorySummary.inventoryStatus.outOfStock}
              </div>
              <p className="text-xs text-muted-foreground">
                {inventorySummary.percentages.outOfStock}% of products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventorySummary.inventoryStatus.lowStock}</div>
              <p className="text-xs text-muted-foreground">
                {inventorySummary.percentages.lowStock}% of products
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(inventorySummary.totalInventoryValue)}
              </div>
              <p className="text-xs text-muted-foreground">Total value of all stock</p>
            </CardContent>
          </Card>
        </div>
      ) : error ? (
        <Card className="bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading inventory data: {error}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Recent Low Stock Alerts */}
      {inventorySummary?.recentLowStockAlerts && inventorySummary.recentLowStockAlerts.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Low Stock Alerts</CardTitle>
            <CardDescription>Products that recently fell below minimum stock level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {inventorySummary.recentLowStockAlerts.map((alert: any, index: number) => (
                <Card key={index} className="border-l-4 border-amber-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{alert.productName}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <Badge
                        variant={alert.stockStatus === 'Out of Stock' ? 'destructive' : 'outline'}
                        className="capitalize"
                      >
                        {alert.stockStatus}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {alert.currentStock} of {alert.minimumStockAlert}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Analytics Charts */}
      {inventorySummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {/* Stock Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Stock Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stockDistributionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {stockDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Products by Value */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Products by Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={topProductsByValue}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'value' ? formatCurrency(Number(value)) : value,
                        name === 'value' ? 'Value' : 'Quantity'
                      ]} 
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Stock Distribution */}
          {categoryStockDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Stock by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={categoryStockDistribution}>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                      <XAxis dataKey="category" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip formatter={(value) => [value, 'Stock Units']} />
                      <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stock Level Analysis */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Stock Level Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ReBarChart data={lowStockTrend}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="range" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip formatter={(value) => [value, 'Products']} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </ReBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Manage your product inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 items-center">
              <Tabs defaultValue="all-products" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all-products">All Products</TabsTrigger>
                  <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
                  <TabsTrigger value="out-of-stock">Out of Stock</TabsTrigger>
                </TabsList>
              </Tabs>

              <Button className="ml-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {loading && !products.length && !lowStockProducts.length ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Stock</TableHead>
                    {activeTab === 'low-stock' && <TableHead>Min. Stock</TableHead>}
                    {activeTab === 'low-stock' && <TableHead>Status</TableHead>}
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeTab === 'all-products' ? (
                    filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <TableRow key={product._id}>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell>
                            {typeof product.categoryId === 'object' ? product.categoryId?.categoryName : 'Uncategorized'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                product.quantity === 0
                                  ? 'destructive'
                                  : product.quantity < 10
                                    ? 'outline'
                                    : 'default'
                              }
                            >
                              {product.quantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {product.discountPrice
                              ? formatCurrency(product.discountPrice)
                              : formatCurrency(product.price || 0)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-2"
                              onClick={() => {
                                setEditingStock(product);
                                setNewStockValue(product.quantity.toString());
                                setEditDialogOpen(true);
                              }}
                            >
                              Edit Stock
                            </Button>
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          {searchTerm
                            ? 'No products found matching your search'
                            : 'No products found'}
                        </TableCell>
                      </TableRow>
                    )
                  ) : filteredLowStock.length > 0 ? (
                    filteredLowStock.map(item => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.product?.productName}</TableCell>
                        <TableCell>
                          {item.product?.category?.categoryName || 'Uncategorized'}
                        </TableCell>
                        <TableCell>{item.stock}</TableCell>
                        {activeTab === 'low-stock' && (
                          <TableCell>{item.minimumStockAlert}</TableCell>
                        )}
                        {activeTab === 'low-stock' && (
                          <TableCell>
                            <Badge
                              variant={
                                item.stockStatus === 'Out of Stock' ? 'destructive' : 'outline'
                              }
                              className="capitalize"
                            >
                              {item.stockStatus}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          {item.product?.discountPrice
                            ? formatCurrency(item.product.discountPrice)
                            : formatCurrency(item.product?.price || 0)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-2"
                            onClick={() => {
                              // Find the full product to edit
                              const productToEdit = products.find((p: any) => p._id === item.productId);
                              if (productToEdit) {
                                setEditingStock(productToEdit);
                                setNewStockValue(item.stock.toString());
                                setEditDialogOpen(true);
                              }
                            }}
                          >
                            Edit Stock
                          </Button>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {searchTerm
                          ? 'No products found matching your search'
                          : activeTab === 'out-of-stock'
                            ? 'No out of stock products'
                            : 'No low stock products found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Stock Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Update the current stock quantity for {editingStock?.productName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stock" className="text-right">
                Current Stock
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={newStockValue}
                onChange={e => setNewStockValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleStockUpdate} disabled={!editingStock}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
