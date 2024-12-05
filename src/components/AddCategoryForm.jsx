import { useState } from "react"
import { useForm } from "react-hook-form"
import { CalendarIcon, X } from 'lucide-react'
import { DayPicker } from "react-day-picker";
import { Button } from "./ui/button"
import axiosInstance from "../api/axiosInstance.js"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Calendar } from "./ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { useUserStore } from "../store/userStore.js";

export function AddCategoryForm({ onClose }) {
  const [date, setDate] = useState()
  const { darkstoreId } = useUserStore();
  const form = useForm({
    defaultValues: {
      categoryName: "",
      description: "",
      status: "private"
    },
  })

  async function onSubmit(values) {
    console.log("values coming from form::",values)
    console.log("this is the darkstoreId::", darkstoreId);
    
    try {
      if(values.featuredImage){
        const res = await axiosInstance.post("/api/v1/category/admin/addcategory", {
          categoryName: values.categoryName,
          description: values.description,
          darkStoreId: darkstoreId,
          status: values.status,
          featuredImage: values.featuredImage
        }, { headers: { 'Content-Type': 'multipart/form-data'} })
        
        console.log("response ahise backendor pora: " + JSON.stringify(res));
      }


      
    } catch (error) {
      console.log("error sending data to server:: " + error);
      
    }
    onClose()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="categoryName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter category description"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="published">published</SelectItem>
                  <SelectItem value="private">private</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featuredImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    field.onChange(e.target.files ? e.target.files[0] : null)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add Category</Button>
        </div>
      </form>
    </Form>
  )
}

