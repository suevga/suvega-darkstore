import { useEffect, useState } from 'react';
import { Search, Package, AlertCircle, BarChart, PlusCircle, Loader2, Filter } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useInventoryStore } from '../store/inventoryStore';
import { useDarkStore } from '../store/darkStore';
import { useProductStore } from '../store/productStore';
import { toast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
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
    updateProductStock
  } = useInventoryStore();
  const [activeTab, setActiveTab] = useState('all-products');
  const [editingStock, setEditingStock] = useState(null);
  const [newStockValue, setNewStockValue] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    // Fetch inventory data when component mounts
    const fetchInventoryData = async () => {
      try {
        const res = await Promise.all([
          getLowStockProducts(darkstoreId),
          getInventorySummary(darkstoreId),
          getInventory(darkstoreId)
        ]);
        console.log("Inventory Data", res);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch inventory data. Please try again.",
          variant: "destructive",
        });
      }
    };

    if (darkstoreId) {
      fetchInventoryData();
    }
  }, [darkstoreId, getLowStockProducts, getInventorySummary, getInventory]);

  // Filter products based on search term and active tab
  const filteredLowStock = lowStockProducts?.filter(item => {
    const productName = item.product?.productName?.toLowerCase() || '';
    const matchesSearch = productName.includes(searchTerm.toLowerCase());
    const matchesTab = 
      activeTab === 'low-stock' || 
      (activeTab === 'out-of-stock' && item.stockStatus === 'Out of Stock') ||
      (activeTab === 'low-stock-only' && item.stockStatus === 'Low Stock');
    
    return matchesSearch && matchesTab;
  }) || [];

  // Filter all products based on search term
  const filteredProducts = products?.filter(product => {
    return product.productName?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    if (!editingStock || newStockValue === '' || isNaN(Number(newStockValue)) || Number(newStockValue) < 0) {
      toast({
        title: "Invalid input",
        description: "Please enter a valid stock quantity (non-negative number).",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await updateProductStock(editingStock._id, parseInt(newStockValue));
      
      if (response) {
        toast({
          title: "Stock updated",
          description: `${editingStock.productName} stock has been updated to ${newStockValue}.`,
          variant: "success",
        });
        
        // Reset state
        setEditingStock(null);
        setNewStockValue('');
        setEditDialogOpen(false);
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update stock. Please try again.",
        variant: "destructive",
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
              <div className="text-2xl font-bold">{inventorySummary.inventoryStatus.outOfStock}</div>
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
              <div className="text-2xl font-bold">{formatCurrency(inventorySummary.totalInventoryValue)}</div>
              <p className="text-xs text-muted-foreground">
                Total value of all stock
              </p>
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
      {inventorySummary?.recentLowStockAlerts?.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Low Stock Alerts</CardTitle>
            <CardDescription>
              Products that recently fell below minimum stock level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {inventorySummary.recentLowStockAlerts.map((alert, index) => (
                <Card key={index} className="border-l-4 border-amber-500">
                  <CardContent className="p-4">
                    <h3 className="font-semibold">{alert.productName}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <Badge 
                        variant={alert.stockStatus === "Out of Stock" ? "destructive" : "outline"}
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
      
      {/* Inventory List */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>
            Manage your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      filteredProducts.map((product) => (
                        <TableRow key={product._id}>
                          <TableCell className="font-medium">{product.productName}</TableCell>
                          <TableCell>{product.categoryId?.categoryName || 'Uncategorized'}</TableCell>
                          <TableCell>
                            <Badge variant={product.quantity === 0 ? "destructive" : product.quantity < 10 ? "outline" : "default"}>
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
                          {searchTerm ? "No products found matching your search" : "No products found"}
                        </TableCell>
                      </TableRow>
                    )
                  ) : (
                    filteredLowStock.length > 0 ? (
                      filteredLowStock.map((item) => (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{item.product?.productName}</TableCell>
                          <TableCell>{item.product?.category?.categoryName || 'Uncategorized'}</TableCell>
                          <TableCell>{item.stock}</TableCell>
                          {activeTab === 'low-stock' && <TableCell>{item.minimumStockAlert}</TableCell>}
                          {activeTab === 'low-stock' && (
                            <TableCell>
                              <Badge 
                                variant={item.stockStatus === "Out of Stock" ? "destructive" : "outline"}
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
                                const productToEdit = products.find(p => p._id === item.productId);
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
                            ? "No products found matching your search" 
                            : activeTab === 'out-of-stock' 
                              ? "No out of stock products" 
                              : "No low stock products found"}
                        </TableCell>
                      </TableRow>
                    )
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
                onChange={(e) => setNewStockValue(e.target.value)}
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