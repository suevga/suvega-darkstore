import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useToast } from "../hooks/use-toast"
import { Button } from "./ui/button"
import axiosInstance from "../api/axiosInstance"
import { X } from 'lucide-react'
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

export function EditProductForm({ product, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [productImages, setProductImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const { darkstoreId } = useDarkStore()
  const { categories } = useCategoryStore()
  const { toast } = useToast()

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

  // Populate form with existing product data
  useEffect(() => {
    if (product) {
      // Set form values
      form.reset({
        productName: product.productName,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() || "",
        quantity: product.quantity.toString(),
        categoryId: product.categoryId,
        status: product.status
      })

      // Set existing product images
      if (product.productImages) {
        setExistingImages(product.productImages.map(img => img.imageUrl))
      }
    }
  }, [product, form])

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.filter(file => 
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
      file.size <= 5000000
    )

    const totalImages = newImages.length + productImages.length + existingImages.length
    const limitedImages = newImages.slice(0, 5 - productImages.length)
    
    if (totalImages > 5) {
      toast({
        title: "Image Limit Exceeded",
        description: "You can upload a maximum of 5 images",
        variant: "destructive"
      })
      return
    }
    
    setProductImages(prev => [...prev, ...limitedImages])
  }

  const removeImage = (indexToRemove) => {
    setProductImages(prev => 
      prev.filter((_, index) => index !== indexToRemove)
    )
  }

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => 
      prev.filter((_, index) => index !== indexToRemove)
    )
  }

  const onSubmit = async (values) => {
    if (productImages.length === 0 && existingImages.length === 0) {
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
      
      // Append form values
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString())
        }
      })

      // Append storeId
      formData.append('storeId', darkstoreId)
      
      // Append new images
      productImages.forEach((file, index) => {
        formData.append('productImages', file)
      })

      // Append existing image URLs to be retained
      if (existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages))
      }

      const response = await axiosInstance.patch(
        `/api/v1/product/admin/product/${product._id}`, 
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if (response.status === 200) {
        toast({
          title: "Product Updated",
          description: "Product updated successfully"
        })
        onSuccess?.()
        onClose()
      }
      
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error Updating Product",
        description: error.response?.data?.message || "Server error updating product",
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
          {/* Product Name Field */}
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

        {/* Description Field */}
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

        {/* Category Field */}
        <FormField
          control={form.control}
          name="categoryId"
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category._id} 
                      value={category._id}
                    >
                      {category.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price and Discount Price */}
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

        {/* Quantity and Status */}
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
        <div className="w-1/3 ml-4">
        <FormField
            control={form.control}
            name="status"
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
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

        {/* Image Upload */}
        <FormItem>
          <FormLabel>Product Images</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={loading || (productImages.length + existingImages.length) >= 5}
              />
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={imageUrl} 
                        alt={`Existing product ${index + 1}`} 
                        className="w-full h-20 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0 w-6 h-6 rounded-full"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* New Images */}
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
              
              <p className="text-sm text-muted-foreground">
                {existingImages.length + productImages.length}/5 images
              </p>
            </div>
          </FormControl>
          {(existingImages.length + productImages.length) === 0 && (
            <FormMessage>Product images are required</FormMessage>
          )}
        </FormItem>

        {/* Action Buttons */}
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
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </div>
        </div>
      </form>
    </Form>
  )
}