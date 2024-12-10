import React, { useEffect, useState } from 'react'
import { useProductStore } from "../store/productStore.js";
import axiosInstance from "../api/axiosInstance.js";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { DeleteProductDialog } from '../components/DeleteProductDialog.jsx';
import { useToast } from "../hooks/use-toast.ts"
import { useCategoryStore } from "../store/categoryStore.js"
import { useUserStore } from '../store/userStore.js';
import { AddProductForm } from '../components/AddProductForm.jsx';
import { ChevronLeft, ChevronRight, Grid2X2, PlusCircle, Search, ShoppingBag } from 'lucide-react';
import { EditProductForm } from "../components/EditProductForm.jsx"

const Products = () => {
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { darkstoreId } = useUserStore();
  const { toast } = useToast();
  const { setProducts, products, setTotalProducts, totalProducts } = useProductStore();
  const { totalCategoryCount } = useCategoryStore();

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // fetch all products from database using DarkstoreId
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await axiosInstance.get("/api/v1/product/admin/getAllProduct", {
        params: {
          page: currentPage,
          limit:10,
          darkStoreId: darkstoreId,
          search: searchTerm,
          status: statusFilter
        }
      })

      const { data } = response.data;
      setProducts(data.products);
      setTotalPages(data.pagination.totalPages);
      setTotalProducts(data.pagination.total);
      
    } catch (error) {
      setError("Failed to fetch products", error.message);
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=> {
    fetchProducts();
  }, [currentPage, searchTerm, statusFilter, darkstoreId]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowEditProductForm(true);
  };

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await axiosInstance.delete(`/api/v1/product/admin/product/${selectedProduct._id}`);

      if (res.data.data.isDelete === true) {
        toast({
          title: "product deleted",
          description: "product has been successfully deleted",
          variant: "success",
        });
        fetchProducts();
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product" || error.message,
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
            <Grid2X2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategoryCount}</div>
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
            <AddProductForm onClose={() => {
              setShowAddProductForm(false);
              fetchProducts();
            }} />
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
            />
          </div>
        </div>
      )}

      <DeleteProductDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        product={selectedProduct?.productName}
      />

      {/* Categories Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount Price</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="font-medium">{product.productName}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.discountPrice}</TableCell>
                
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {product.quantity}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={product.status === "published" ? "default" : "secondary"}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                  onClick={()=> handleEditClick(product)} 
                  variant="ghost" 
                  size="sm">
                    Edit
                  </Button>
                  <Button 
                    onClick={()=> handleDeleteClick(product)}
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-900 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
  )
}

export default Products