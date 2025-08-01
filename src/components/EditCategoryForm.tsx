import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';

export function EditCategoryForm({ category, onClose }: {
  category: any;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      categoryName: category.categoryName,
      description: category.description,
      status: category.status,
      featuredImage: null,
    },
  });

  async function onSubmit(values: any) {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('categoryName', values.categoryName);
      formData.append('description', values.description);
      formData.append('status', values.status);
      if (values.featuredImage) {
        formData.append('featuredImage', values.featuredImage);
      }

      const response = await axiosInstance.patch(
        `/api/v1/category/admin/category/${category._id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.status === 200) {
        console.log('Successfully updated category::', JSON.stringify(response));

        toast({
          title: 'category updated successfully',
          description: 'Category details updated successfully',
          variant: 'success',
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Error updating category',
        description: 'Error updating category details',
        variant: 'destructive',
      });
      console.error('Error updating category:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                <Textarea placeholder="Enter category description" {...field} />
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={e => field.onChange(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Category'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
