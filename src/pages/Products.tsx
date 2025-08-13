import { useEffect, useState } from 'react';
import { useProductStore } from '../store/productStore';
import { useBackend } from '../hooks/useBackend';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '../components/ui/alert-dialog';
import { useToast } from '../hooks/use-toast';
import { useCategoryStore } from '../store/categoryStore';
import { useDarkStore } from '../store/darkStore';
import { AddProductForm } from '../components/AddProductForm';
import { EditProductForm } from '../components/EditProductForm';
import { StatusToggle } from '../components/StatusToggle';
import { ChevronLeft, ChevronRight, PlusCircle, Search, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';

const Products = () => {
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { darkstoreId } = useDarkStore();
  const api = useBackend();
  const { toast } = useToast();
  const { setProducts, products, setTotalProducts, totalProducts } = useProductStore();
  const { totalCategoryCount } = useCategoryStore();

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.getAllProductsPaged(currentPage, 10, darkstoreId || undefined, searchTerm || undefined, statusFilter || undefined);

      const { data } = response.data;
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
      setTotalProducts(data.pagination.total);
    } catch (error) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, statusFilter, darkstoreId]);

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setShowEditProductForm(true);
  };

  const handleDeleteClick = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedProduct) {
        const res = await api.deleteProduct(selectedProduct._id);

        if (res.data.data.isDelete === true) {
          toast({
            title: 'product deleted',
            description: 'product has been successfully deleted',
            variant: 'success',
          });
          fetchProducts();
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const toggleStatus = async (product: any) => {
    try {
      const updatedStatus = product.status === 'published' ? 'private' : 'published';
      await api.toggleProductStatus(product._id, updatedStatus);
      toast({
        title: 'Success',
        description: `Product status changed to ${updatedStatus}`,
        variant: 'success',
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle product status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <div className="text-2xl font-bold">{totalCategoryCount}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Product Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Product Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Product Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Published', value: products.filter(p => p.status === 'published').length, fill: '#10b981' },
                      { name: 'Private', value: products.filter(p => p.status === 'private').length, fill: '#ef4444' },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    <Cell key="published" fill="#10b981" />
                    <Cell key="private" fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Product Price Range Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Price Range Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { range: '₹0-₹100', count: products.filter(p => p.price <= 100).length },
                  { range: '₹100-₹500', count: products.filter(p => p.price > 100 && p.price <= 500).length },
                  { range: '₹500-₹1000', count: products.filter(p => p.price > 500 && p.price <= 1000).length },
                  { range: '₹1000+', count: products.filter(p => p.price > 1000).length },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip formatter={(value) => [value, 'Products']} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { level: 'Low Stock', count: products.filter(p => p.quantity <= 10).length, fill: '#ef4444' },
                  { level: 'Medium Stock', count: products.filter(p => p.quantity > 10 && p.quantity <= 50).length, fill: '#f59e0b' },
                  { level: 'High Stock', count: products.filter(p => p.quantity > 50).length, fill: '#10b981' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="level" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip formatter={(value) => [value, 'Products']} />
                  <Area dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full md:w-auto" onClick={() => setShowAddProductForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {showAddProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <AddProductForm
              onClose={() => {
                setShowAddProductForm(false);
                fetchProducts();
              }}
              onSuccess={() => {
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}

      {loading && <div className="text-center py-4">Loading products...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {showEditProductForm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
            <EditProductForm
              product={selectedProduct}
              onClose={() => {
                setShowEditProductForm(false);
                setSelectedProduct(null);
                fetchProducts();
              }}
              onSuccess={() => {
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="py-4">
              This action will not be reversible. Are you sure you want to delete permanently?
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleDeleteConfirm();
                setShowDeleteDialog(false);
              }}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Categories Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => (
              <TableRow key={product._id}>
                <TableCell className="font-medium cursor-pointer hover:text-blue-600" onClick={() => handleProductClick(product)}>
                  <div className="max-w-xs truncate">
                    {product.productName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate">
                    {product.description ? (product.description.length > 50
                      ? `${product.description.substring(0, 50)}...`
                      : product.description)
                    : 'No Description'}
                  </div>
                </TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.discountPrice}</TableCell>

                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {product.quantity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === 'published' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <StatusToggle 
                      status={product.status}
                      onToggle={() => toggleStatus(product)}
                      size="sm"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEditClick(product)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedProduct(product);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Product Details Modal */}
      {showProductModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedProduct.productName}</h3>
              <button onClick={() => { setSelectedProduct(null); setShowProductModal(false); }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <p><strong>Price:</strong> ₹{selectedProduct.price}</p>
              <p><strong>Discount Price:</strong> ₹{selectedProduct.discountPrice}</p>
              <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
              <p><strong>Description:</strong> {selectedProduct.description || 'No Description'}</p>
              <div>
                <strong>Status:</strong>
                <span>
                  <Badge variant={selectedProduct.status === 'published' ? 'default' : 'secondary'}>
                    {selectedProduct.status}
                  </Badge>
                </span>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => toggleStatus(selectedProduct)}>
                {selectedProduct.status === 'published' ? 'Make Private' : 'Publish'}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowProductModal(false);
                handleEditClick(selectedProduct);
              }}>
                <Edit3 className="mr-2 h-4 w-4" />Edit
              </Button>
              <Button variant="destructive" onClick={() => {
                setShowProductModal(false);
                handleDeleteClick(selectedProduct);
              }}>
                <Trash2 className="mr-2 h-4 w-4" />Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;
