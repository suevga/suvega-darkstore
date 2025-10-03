import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../hooks/use-toast';
import { Button } from './ui/button';
import { useBackend } from '../hooks/useBackend';
import { X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useDarkStore } from '../store/darkStore';
import { ImagePreview } from './ImagePreview';
import { CategorySelector } from './CategorySelector';

interface AddProductFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProductFormData {
  productName: string;
  description: string;
  price: string;
  discountPrice: string;
  quantity: string;
  categoryId: string;
  status: string;
}

export function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const { darkstoreId } = useDarkStore();
  const { toast } = useToast();
  const api = useBackend();

  const form = useForm({
    defaultValues: {
      productName: '',
      description: '',
      price: '',
      discountPrice: '',
      quantity: '',
      categoryId: '',
      status: 'private',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.filter(
      (file: File) =>
        ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg'].includes(file.type) &&
        file.size <= 1000000 // 1MB
    );

    const limitedImages = newImages.slice(0, 5 - productImages.length);
    setProductImages(prev => [...prev, ...limitedImages]);
  };

  const removeImage = (indexToRemove: number) => {
    setProductImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const onSubmit = async (values: ProductFormData) => {
    if (productImages.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload at least one product image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString());
        }
      });

      formData.append('storeId', darkstoreId || '');

      productImages.forEach((file) => {
        formData.append('productImages', file);
      });

      const response = await api.createProduct(formData, darkstoreId || undefined);

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: 'Product Created',
          description: 'New product created successfully',
        });

        if (typeof onSuccess === 'function') {
          onSuccess();
        }

        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        throw new Error(response.data?.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Error Creating Product',
        description:
          (error as any).response?.data?.message || (error as Error).message || 'Server error creating product',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 flex justify-between items-start"
      >
        <div className="w-2/3">
          <FormField
            control={form.control}
            name="productName"
            rules={{
              required: 'Product name is required',
              minLength: {
                value: 2,
                message: 'Product name must be at least 2 characters',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            rules={{
              required: 'Description is required',
              minLength: {
                value: 10,
                message: 'Description must be at least 10 characters',
              },
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
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategorySelector
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                    darkstoreId={darkstoreId || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              rules={{
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter price"
                      {...field}
                      onChange={e => field.onChange(e.target.value)}
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
                min: { value: 0, message: 'Discount price must be positive' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter discount price"
                      {...field}
                      onChange={e => field.onChange(e.target.value)}
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
                required: 'Quantity is required',
                min: { value: 0, message: 'Quantity must be positive' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter quantity"
                      {...field}
                      onChange={e => field.onChange(e.target.value)}
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
            rules={{ required: 'Status is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={loading}>
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
            {productImages.length === 0 && <FormMessage>Product images are required</FormMessage>}
          </FormItem>

          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Add Product'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
