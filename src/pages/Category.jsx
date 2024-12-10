import React from 'react';
import { useState, useEffect } from 'react';
import { PlusCircle, Search, Package2, Grid2X2, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import axiosInstance from "../api/axiosInstance";
import { useUserStore } from "../store/userStore.js";

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
import { AddCategoryForm } from "../components/AddCategoryForm";
import { EditCategoryForm } from "../components/EditCategoryForm.jsx"
import { DeleteCategoryDialog } from '../components/DeleteCategoryDialog.jsx';
import { useToast } from "../hooks/use-toast.ts"
import { useCategoryStore } from "../store/categoryStore.js"
import { useProductStore } from "../store/productStore.js"
export default function CategoriesPage() {
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showEditCategoryForm, setShowEditCategoryForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { darkstoreId } = useUserStore();
  const { toast } = useToast();
  const { setTotalCategoryCount, totalCategoryCount, setCategories, categories } = useCategoryStore();
  const { totalProducts }  = useProductStore();
// Pagination and filter states
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get("/api/v1/category/admin/getcategories", {
        params: {
          page: currentPage,
          limit: 10,
          darkStoreId: darkstoreId,
          search: searchTerm,
          status: statusFilter
        }
      });
      
      
      const { data } = response.data;
      setCategories(data.categories);
      setTotalPages(data.pagination.totalPages);
      setTotalCategoryCount(data.pagination.total);
      
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, darkstoreId]);


  
  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setShowEditCategoryForm(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/api/v1/category/admin/category/${selectedCategory._id}`);
      toast({
        title: "Category deleted",
        description: "Category has been successfully deleted",
        variant: "success",
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedCategory(null);
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
            <AddCategoryForm onClose={() => {
              setShowAddCategoryForm(false);
              fetchCategories();
            }} />
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
      <DeleteCategoryDialog 
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        categoryName={selectedCategory?.categoryName}
      />
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
              <TableHead>Added Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <img
                  src={category.featuredImage}
                  width={80}
                  className="w-[80px] h-[80px] rounded-[50%] border-2 border-red-300 cursor-pointer"
                  alt="featured-image"
                  />
                </TableCell>
                <TableCell className="font-medium">{category.categoryName}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {category.productCount}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.status === "published" ? "default" : "secondary"}>
                    {category.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                  onClick={()=> handleEditClick(category)} 
                  variant="ghost" 
                  size="sm">
                    Edit
                  </Button>
                  <Button 
                    onClick={()=> handleDeleteClick(category)}
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
  );
}