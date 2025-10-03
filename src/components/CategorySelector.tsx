import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import axiosInstance from '../api/axiosInstance';
import { useToast } from '../hooks/use-toast';

interface CategoryType {
  _id: string;
  categoryName: string;
}

interface CategorySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  darkstoreId: string;
}

export function CategorySelector({ value, onValueChange, disabled, darkstoreId }: CategorySelectorProps) {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      
      const response = await axiosInstance.get('/api/v1/category/admin/getcategories', {
        params: {
          page,
          limit: 10,
          darkStoreId: darkstoreId,
          searchTerm: search || undefined,
        },
      });

      const { data } = response.data;
      if (!data?.categories) return;

      if (page === 1) {
        setCategories(data.categories);
      } else {
        setCategories(prev => [...prev, ...data.categories]);
      }

      setTotalPages(data.pagination.totalPages);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (darkstoreId) {
      fetchCategories(1, searchTerm);
    }
  }, [darkstoreId, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const loadMoreCategories = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentPage < totalPages && !isLoading) {
      fetchCategories(currentPage + 1, searchTerm);
    }
  };

  return (
    <Select onValueChange={onValueChange} value={value} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder="Select a category" />
      </SelectTrigger>
      <SelectContent className="max-h-[350px] p-0">
        <div className="p-2 border-b sticky top-0 bg-white z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-8"
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        
        <div className="max-h-[250px] overflow-y-auto">
          {categories.map(category => (
            <SelectItem key={category._id} value={category._id}>
              {category.categoryName}
            </SelectItem>
          ))}
          
          {categories.length === 0 && !isLoading && (
            <div className="p-4 text-center text-muted-foreground">
              No categories found
            </div>
          )}
        </div>

        {currentPage < totalPages && (
          <div className="p-2 border-t sticky bottom-0 bg-white z-10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={loadMoreCategories}
              onMouseDown={(e) => e.stopPropagation()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Show More'
              )}
            </Button>
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
