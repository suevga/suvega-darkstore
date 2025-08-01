import { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Search, Grid2X2, ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Calendar, Edit3, Trash2, MoreHorizontal } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
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
import axiosInstance from '../api/axiosInstance';
import { useDarkStore } from '../store/darkStore';

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
import { AddCategoryForm } from '../components/AddCategoryForm';
import { EditCategoryForm } from '../components/EditCategoryForm';
import { DeleteCategoryDialog } from '../components/DeleteCategoryDialog';
import { StatusToggle } from '../components/StatusToggle';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "../components/ui/alert-dialog";
import { useToast } from '../hooks/use-toast';
import { useCategoryStore } from '../store/categoryStore';
import { useProductStore } from '../store/productStore';

export default function CategoriesPage() {
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { darkstoreId } = useDarkStore();
  const { toast } = useToast();
  const { setTotalCategoryCount, totalCategoryCount, setCategories, categories } =
    useCategoryStore();
  const { totalProducts } = useProductStore();
  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/api/v1/category/admin/getcategories', {
        params: {
          page: currentPage,
          limit: 10,
          darkStoreId: darkstoreId,
          search: searchTerm,
          status: statusFilter,
        },
      });

      const { data } = response.data;
      setCategories(data.categories);
      setTotalPages(data.pagination.totalPages);
      setTotalCategoryCount(data.pagination.total);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, darkstoreId]);

  const handleEditClick = (category: any) => {
    setSelectedCategory(category);
    setShowEditCategoryForm(true);
  };

  const handleDeleteClick = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (selectedCategory) {
        await axiosInstance.delete(`/api/v1/category/admin/category/${selectedCategory._id}`);
        toast({
          title: 'Category deleted',
          description: 'Category has been successfully deleted',
          variant: 'success',
        });
      }
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive',
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedCategory(null);
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

  const toggleStatus = async (category: any) => {
    try {
      const updatedStatus = category.status === 'published' ? 'private' : 'published';
      await axiosInstance.patch(`/api/v1/category/admin/category/${category._id}`, {
        status: updatedStatus,
      });
      toast({
        title: 'Success',
        description: `Category status changed to ${updatedStatus}`,
        variant: 'success',
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle category status',
        variant: 'destructive',
      });
    }
  };

  // Analytics data
  const categoryStatusData = useMemo(() => [
    { name: 'Published', value: categories.filter(cat => cat.status === 'published').length, fill: '#10b981' },
    { name: 'Private', value: categories.filter(cat => cat.status === 'private').length, fill: '#ef4444' },
  ], [categories]);

  const categoryProductDistribution = useMemo(() => {
    return categories
      .filter(cat => cat.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 6)
      .map(cat => ({
        name: cat.categoryName.length > 10 ? cat.categoryName.substring(0, 10) + '...' : cat.categoryName,
        products: cat.productCount
      }));
  }, [categories]);

  const categoryCreationTrend = useMemo(() => {
    const monthCounts = {};
    categories.forEach(category => {
      const date = new Date(category.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, categories: count }))
      .slice(-6);
  }, [categories]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Grid2X2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategoryCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Category Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Category Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {categoryStatusData.map((entry, index) => (
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

        {/* Category Product Distribution */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Products per Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryProductDistribution}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip formatter={(value) => [value, 'Products']} />
                  <Bar dataKey="products" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Creation Trend */}
        {categoryCreationTrend.length > 0 && (
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Category Creation Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={categoryCreationTrend}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip formatter={(value) => [value, 'Categories']} />
                    <Legend />
                    <Line type="monotone" dataKey="categories" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
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
        <Button className="w-full md:w-auto" onClick={() => setShowAddCategoryForm(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {showAddCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
            <AddCategoryForm
              onClose={() => {
                setShowAddCategoryForm(false);
                fetchCategories();
              }}
              onSuccess={() => {
                fetchCategories();
              }}
            />
          </div>
        </div>
      )}

      {loading && <div className="text-center py-4">Loading categories...</div>}
      {error && <div className="text-red-500 text-center py-4">{error}</div>}

      {showEditCategoryForm && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Category</h2>
            <EditCategoryForm
              category={selectedCategory}
              onClose={() => {
                setShowEditCategoryForm(false);
                setSelectedCategory(null);
                fetchCategories();
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
              <TableHead>FeaturedImage</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category._id}>
                <TableCell>
                  <img
                    src={category.featuredImage}
                    width={80}
                    className="w-[80px] h-[80px] rounded-[50%] border-2 border-red-300 cursor-pointer"
                    alt="featured-image"
                  />
                </TableCell>
                <TableCell className="font-medium cursor-pointer hover:text-blue-600" onClick={() => handleCategoryClick(category)}>
                  <div className="max-w-xs truncate">
                    {category.categoryName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    {category.description.length > 50 
                      ? `${category.description.substring(0, 50)}...` 
                      : category.description
                    }
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {category.productCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.status === 'published' ? 'default' : 'secondary'}>
                    {category.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <StatusToggle 
                      status={category.status}
                      onToggle={() => toggleStatus(category)}
                      size="sm"
                    />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => handleEditClick(category)}>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => {
                          setSelectedCategory(category);
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

      {/* Category Details Modal */}
      {showCategoryModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Details</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setShowCategoryModal(false);
                    setSelectedCategory(null);
                  }}
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Category Image */}
                <div className="flex justify-center">
                  <img
                    src={selectedCategory.featuredImage}
                    alt={selectedCategory.categoryName}
                    className="w-32 h-32 rounded-full border-4 border-gray-200 dark:border-gray-600 object-cover"
                  />
                </div>
                
                {/* Category Information */}
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category Name</label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCategory.categoryName}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedCategory.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <div className="mt-1">
                        <Badge variant={selectedCategory.status === 'published' ? 'default' : 'secondary'}>
                          {selectedCategory.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Products Count</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{selectedCategory.productCount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(selectedCategory.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated At</label>
                      <p className="text-gray-600 dark:text-gray-400">
                        {new Date(selectedCategory.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCategoryModal(false);
                      handleEditClick(selectedCategory);
                    }}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit Category
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowCategoryModal(false);
                      handleDeleteClick(selectedCategory);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Category
                  </Button>
                  
                  <Button
                    onClick={() => toggleStatus(selectedCategory)}
                    variant={selectedCategory.status === 'published' ? 'secondary' : 'default'}
                  >
                    {selectedCategory.status === 'published' ? 'Make Private' : 'Publish'}
                  </Button>
                </div>
              </div>
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
}
