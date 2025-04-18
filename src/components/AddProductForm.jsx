import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { useToast } from "../hooks/use-toast"
import { Button } from "./ui/button"
import axiosInstance from "../api/axiosInstance"
import { X, Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useDarkStore } from "../store/darkStore.js"
import { useCategoryStore } from "../store/categoryStore"
import { ImagePreview } from "./ImagePreview"

export function AddProductForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [productImages, setProductImages] = useState([])
  const { darkstoreId } = useDarkStore()
  const { categories: storeCategories } = useCategoryStore()
  const { toast } = useToast()
  
  // Add new state for categories pagination
  const [categories, setCategories] = useState([])
  const [categoryPage, setCategoryPage] = useState(1)
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [hasMoreCategories, setHasMoreCategories] = useState(true)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const selectContentRef = useRef(null)

  const form = useForm({
    defaultValues: {
      productName: "",
      description: "",
      price: "",
      discountPrice: "",
      quantity: "",
      categoryId: "",
      status: "private",
    },
  })

  // Function to fetch categories with pagination
  const fetchCategories = async (page = 1) => {
    try {
      setIsLoadingCategories(true)
      console.log(`Fetching categories page ${page} for darkstore ${darkstoreId}`)
      
      const response = await axiosInstance.get('/api/v1/category/admin/getcategories', {
        params: {
          page,
          limit: 10,
          darkStoreId: darkstoreId
        }
      })
      
      console.log("Categories API response:", response.data)
      
      const { data } = response.data
      
      if (!data || !data.categories) {
        console.error("Invalid response format:", response.data)
        toast({
          title: "Error",
          description: "Invalid data format received from server",
          variant: "destructive"
        })
        return
      }
      
      const newCategories = data.categories
      
      if (page === 1) {
        setCategories(newCategories)
      } else {
        // Make sure we're not adding duplicates
        setCategories(prev => {
          const existingIds = prev.map(cat => cat._id)
          const filteredNew = newCategories.filter(cat => !existingIds.includes(cat._id))
          return [...prev, ...filteredNew]
        })
      }
      
      // Check if there are more categories to load
      const hasNext = data.pagination?.hasNextPage || 
                      (data.pagination?.currentPage < data.pagination?.totalPages)
                      
      console.log(`Has more categories: ${hasNext}, Current page: ${data.pagination?.currentPage}, Total pages: ${data.pagination?.totalPages}`)
      
      setHasMoreCategories(hasNext)
      setCategoryPage(page)
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories: " + (error.response?.data?.message || error.message),
        variant: "destructive"
      })
    } finally {
      setIsLoadingCategories(false)
    }
  }

  // Load initial categories
  useEffect(() => {
    fetchCategories()
  }, [darkstoreId])

  // Load more categories on button click
  const loadMoreCategories = () => {
    console.log(`Loading more categories, current page: ${categoryPage}, has more: ${hasMoreCategories}`)
    if (hasMoreCategories && !isLoadingCategories) {
      const nextPage = categoryPage + 1
      console.log(`Fetching page ${nextPage}`)
      fetchCategories(nextPage)
    }
  }

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId)
    form.setValue("categoryId", categoryId)
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg'].includes(file.type) &&
      file.size <= 1000000 // 1MB
    )

    const limitedImages = newImages.slice(0, 5 - productImages.length)
    
    setProductImages(prev => [...prev, ...limitedImages])
  }

  const removeImage = (indexToRemove) => {
    setProductImages(prev => 
      prev.filter((_, index) => index !== indexToRemove)
    )
  }

  const onSubmit = async (values) => {
    if (productImages.length === 0) {
      toast({
        title: "Error",
        description: "Please upload at least one product image",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString())
        }
      })

      formData.append('storeId', darkstoreId)
      
      productImages.forEach((file, index) => {
        formData.append('productImages', file)
      })

      const response = await axiosInstance.post(
        "/api/v1/product/admin/createProduct", 
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { darkstoreId }
        }
      )
      
      if (response.status >= 200 && response.status < 300) {
        console.log("product created successfully::", JSON.stringify(response));

        toast({
          title: "Product Created",
          description: "New product created successfully"
        })
        
        // Call onSuccess if provided
        if (typeof onSuccess === 'function') {
          onSuccess()
        }
        
        // Ensure the form closes
        if (typeof onClose === 'function') {
          onClose()
        }
      } else {
        throw new Error(response.data?.message || "Failed to create product")
      }
      
    } catch (error) {
      console.error("Error creating product:", error)
      toast({
        title: "Error Creating Product",
        description: error.response?.data?.message || error.message || "Server error creating product",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex justify-between items-start">
        <div className="w-2/3">
        <FormField
          control={form.control}
          name="productName"
          rules={{ 
            required: "Product name is required",
            minLength: {
              value: 2,
              message: "Product name must be at least 2 characters"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter product name" 
                  {...field} 
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          rules={{
            required: "Description is required",
            minLength: {
              value: 10,
              message: "Description must be at least 10 characters"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  className="min-h-[100px]"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent 
                  ref={selectContentRef}
                  className="max-h-[200px] relative"
                >
                  {categories.map((category) => (
                    <SelectItem 
                      key={category._id} 
                      value={category._id}
                    >
                      {category.categoryName}
                    </SelectItem>
                  ))}
                  
                  {/* Always show the button for testing */}
                  <div className="py-2 px-2 border-t mt-1 sticky bottom-0 bg-white">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Use a timeout to prevent dropdown from closing
                        setTimeout(() => {
                          loadMoreCategories();
                        }, 10);
                        console.log("Show More button clicked");
                      }}
                      disabled={isLoadingCategories}
                    >
                      {isLoadingCategories ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading Categories...
                        </>
                      ) : (
                        "Show More Categories"
                      )}
                    </Button>
                  </div>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            rules={{ 
              required: "Price is required",
              min: { value: 0, message: "Price must be positive" }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter price" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPrice"
            rules={{ 
              min: { value: 0, message: "Discount price must be positive" }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter discount price" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            rules={{ 
              required: "Quantity is required",
              min: { value: 0, message: "Quantity must be positive" }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter quantity" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>
          
        </div>
        
        <div className="w-1/3 pl-4">
        <FormField
            control={form.control}
            name="status"
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
          <FormLabel>Product Images</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={loading || productImages.length >= 5}
              />
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((file, index) => (
                    <div key={index} className="relative">
                      <ImagePreview file={file} />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 w-6 h-6 rounded-full"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {productImages.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {productImages.length}/5 images selected
                </p>
              )}
            </div>
          </FormControl>
          {productImages.length === 0 && (
            <FormMessage>Product images are required</FormMessage>
          )}
        </FormItem>

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Add Product"}
          </Button>
        </div>
        </div>
        
      </form>
    </Form>
    
  )
}

