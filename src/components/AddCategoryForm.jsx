import { useState } from "react"
import { useForm } from "react-hook-form"
import { useToast } from "../hooks/use-toast.ts"
import { Button } from "./ui/button.tsx"
import axiosInstance from "../api/axiosInstance.js"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form.tsx"
import { Input } from "./ui/input.tsx"
import { Textarea } from "./ui/textarea.tsx"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select.tsx"
import { useDarkStore } from "../store/darkStore.js"
import { ImagePreview } from "./ImagePreview.jsx"

export function AddCategoryForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const { darkstoreId } = useDarkStore()
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      categoryName: "",
      description: "",
      status: "private",
      featuredImage: null
    },
  })

  async function onSubmit(values) {
    try {
      setLoading(true)
      const formData = new FormData()
      
      // Append all form fields to FormData
      formData.append('categoryName', values.categoryName)
      formData.append('description', values.description)
      formData.append('darkStoreId', darkstoreId)
      formData.append('status', values.status)
      
      if (values.featuredImage) {
        formData.append('featuredImage', values.featuredImage)
      }

      const response = await axiosInstance.post(
        "/api/v1/category/admin/addcategory", 
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          params: { darkstoreId }
        }
      )

      if (response.status === 200) {
        toast({
          title: "Category Created",
          description: "New category created successfully"
        })
      }
      onSuccess?.()
      onClose()
      
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error Creating Category",
        description: error.message || "server error creating category",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="categoryName"
          rules={{ 
            required: "Category name is required",
            minLength: {
              value: 2,
              message: "Category name must be at least 2 characters"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter category name" 
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
                  placeholder="Enter category description"
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
                    <SelectValue placeholder="Select category status" />
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

        <FormField
          control={form.control}
          name="featuredImage"
          rules={{
            required: "Featured image is required",
            validate: {
              fileSize: (value) => {
                if (!value) return true
                return value.size <= 5000000 || "Image must be less than 5MB"
              },
              fileType: (value) => {
                if (!value) return true
                return [
                  'image/jpeg',
                  'image/png',
                  'image/webp'
                ].includes(value.type) || "Only JPEG, PNG and WebP images are allowed"
              }
            }
          }}
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      onChange(file)
                    }}
                    disabled={loading}
                    {...field}
                  />
                  {value && <ImagePreview file={value} />}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            {loading ? "Creating..." : "Add Category"}
          </Button>
        </div>
      </form>
    </Form>
  )
}