import React, { useState, useEffect, useMemo } from "react"
import { toast } from "../hooks/use-toast"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import { Badge } from "../components/ui/badge"
import {
  PlusCircle,
  Tag,
  Package,
  Search,
  MoreHorizontal,
  Trash2,
  Megaphone,
  AlertTriangle
} from "lucide-react"
import { useBanner } from "../hooks/useBanner"
import { useDarkStore } from "../store/darkStore";


export default function BannersPage() {
  const { 
    banners, 
    loading, 
    addingBanner,
    searchTerm, 
    categoryFilter, 
    statsCount,
    fetchBanners, 
    setSearchTerm, 
    setCategoryFilter,
    addBanner,
    updateBannerStatus,
    deleteBanner,
    getFilteredBanners
  } = useBanner()

  const [showAddBannerDialog, setShowAddBannerDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState(null)
  const { darkstoreId } = useDarkStore();
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    tags: "",
    storeId: darkstoreId,
    isActive: false,
  })
  const [bannerImage, setBannerImage] = useState(null)

  // Fetch banners on component mount
  useEffect(() => {
    fetchBanners(darkstoreId)
  }, [fetchBanners])

  // Use useMemo to safely get filtered banners and add error handling
  const filteredBanners = useMemo(() => {
    try {
      return getFilteredBanners() || [];
    } catch (error) {
      console.error("Error filtering banners:", error);
      return [];
    }
  }, [getFilteredBanners]);

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value === "true" ? true : value === "false" ? false : value
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log("Selected file:", file.name, file.type, file.size)
      setBannerImage(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !bannerImage) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      })
      return
    }

    console.log("Submitting banner with image:", bannerImage.name)
    const success = await addBanner(formData, bannerImage)
    if (success) {
      setShowAddBannerDialog(false)
      resetForm()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      tags: "",
      storeId: darkstoreId,
      isActive: false
    })
    setBannerImage(null)
  }

  const confirmDelete = (banner) => {
    setSelectedBanner(banner)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!selectedBanner) return
    await deleteBanner(selectedBanner._id, darkstoreId)
    setShowDeleteDialog(false)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Check if banners data is valid
  const isValidBannersData = Array.isArray(banners) && banners.length > 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
        <Button onClick={() => setShowAddBannerDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Banner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offer Banners</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsCount.offer}</div>
            <p className="text-xs text-muted-foreground">
              {statsCount.offer > 0 ? 'Active campaigns' : 'No active campaigns'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Banners</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsCount.product}</div>
            <p className="text-xs text-muted-foreground">
              {statsCount.product > 0 ? 'Featured products' : 'No product banners'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Category Banners</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsCount.category}</div>
            <p className="text-xs text-muted-foreground">
              {statsCount.category > 0 ? 'Category promotions' : 'No category banners'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertisement Banners</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsCount.advertisement}</div>
            <p className="text-xs text-muted-foreground">
              {statsCount.advertisement > 0 ? 'Ad campaigns' : 'No advertisements'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search banners..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            defaultValue={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="offer">Offer</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="advertisement">Advertisement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Banners Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banner Name</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">Loading...</TableCell>
              </TableRow>
            ) : !Array.isArray(filteredBanners) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-red-500">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />
                  Error: Invalid banner data
                </TableCell>
              </TableRow>
            ) : filteredBanners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No banners found</TableCell>
              </TableRow>
            ) : (
              filteredBanners.map((banner) => (
                <TableRow key={banner._id || `banner-${Math.random()}`}>
                  <TableCell className="font-medium">{banner.name || 'Unnamed Banner'}</TableCell>
                  <TableCell>
                    {banner.image ? (
                      <img 
                        src={banner.image} 
                        alt={banner.name || 'Banner'}
                        className="h-12 w-20 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x60?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="h-12 w-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{banner.category || 'Uncategorized'}</Badge>
                  </TableCell>
                  <TableCell>
                    {Array.isArray(banner.tags) ? (
                      banner.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="mr-1">{tag}</Badge>
                      ))
                    ) : (
                      <span className="text-gray-500">No tags</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={String(Boolean(banner.isActive))} 
                      onValueChange={(value) => 
                        updateBannerStatus(banner._id, value === "true", darkstoreId)
                      }
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDelete(banner)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Banner Dialog */}
      <Dialog open={showAddBannerDialog} onOpenChange={setShowAddBannerDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Banner</DialogTitle>
            <DialogDescription>
              Create a new banner for your campaigns. Fill all required fields and click save.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3" 
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category *
                </Label>
                <Select
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offer">Offer</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tags" className="text-right">
                  Tags
                </Label>
                <Input 
                  id="tags" 
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="col-span-3" 
                  placeholder="Comma separated tags"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="banner-image" className="text-right">
                  Banner Image *
                </Label>
                <Input 
                  id="banner-image" 
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="col-span-3" 
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  defaultValue="false"
                  onValueChange={(value) => handleSelectChange("isActive", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Hidden input for storeId */}
              <input 
                type="hidden" 
                name="storeId" 
                value={formData.storeId} 
              />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" type="button" onClick={() => setShowAddBannerDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addingBanner}>
                {addingBanner ? 'Adding...' : 'Save Banner'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner
              "{selectedBanner?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 