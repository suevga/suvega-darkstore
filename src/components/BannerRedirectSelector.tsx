import React, { useState, useEffect, useMemo } from 'react';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Loader2, Package, Tag, ShoppingBag, Megaphone } from 'lucide-react';
import { useProducts, type ProductOption } from '../hooks/useProducts';
import { useCategories, type CategoryOption } from '../hooks/useCategories';

export type BannerCategory = 'offer' | 'product' | 'category' | 'advertisement';

interface BannerRedirectSelectorProps {
  category: BannerCategory | '';
  redirectUrl: string;
  onRedirectUrlChange: (redirectUrl: string) => void;
  className?: string;
}

interface SelectionOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
}

export const BannerRedirectSelector: React.FC<BannerRedirectSelectorProps> = ({
  category,
  redirectUrl,
  onRedirectUrlChange,
  className = '',
}) => {
  const [selectedType, setSelectedType] = useState<'product' | 'category' | ''>('');
  const { products, loading: productsLoading, error: productsError, hasMore, loadMore, setPage } = useProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  // Reset selection when category changes and set default type where applicable
  useEffect(() => {
    console.log('[BannerRedirectSelector] Category changed:', category);
    // reset target when category changes
    onRedirectUrlChange('');
    if (category === 'product') {
      if (selectedType !== 'product') {
        setSelectedType('product');
      }
      setPage(1);
      console.log('[BannerRedirectSelector] Selected type set to product (direct)');
    } else if (category === 'category') {
      if (selectedType !== 'category') {
        setSelectedType('category');
      }
      console.log('[BannerRedirectSelector] Selected type set to category (direct)');
    } else {
      // offer or advertisement
      if (selectedType !== '') {
        setSelectedType('');
      }
      console.log('[BannerRedirectSelector] Selected type cleared (offer/advertisement)');
    }
  // Intentionally only depend on category to avoid effect loops from changing function identities
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  // Get available options based on category and selectedType
  const options = useMemo<SelectionOption[]>(() => {
    if (category === 'product' || (category !== '' && selectedType === 'product')) {
      return products.map((product: ProductOption) => ({
        value: product._id,
        label: product.name,
        sublabel: `$${product.price} • ${product.categoryName}`,
        icon: <Package className="h-4 w-4" />,
      }));
    }
    if (category === 'category' || (category !== '' && selectedType === 'category')) {
      return categories.map((cat: CategoryOption) => ({
        value: cat._id,
        label: cat.name,
        sublabel: `${cat.productCount} products`,
        icon: <Tag className="h-4 w-4" />,
      }));
    }
    return [];
  }, [category, selectedType, products, categories]);

  const getCategoryDescription = (): string => {
    switch (category) {
      case 'product':
        return 'Select a specific product that customers will be redirected to when they click this banner.';
      case 'category':
        return 'Select a category that customers will be redirected to when they click this banner.';
      case 'offer':
        return 'Select either a specific product or category for this promotional offer banner.';
      case 'advertisement':
        return 'Select either a specific product or category for this advertisement banner.';
      default:
        return 'Please select a banner category first.';
    }
  };

  const getCategoryIcon = () => {
    switch (category) {
      case 'product':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'category':
        return <Tag className="h-5 w-5 text-amber-500" />;
      case 'offer':
        return <ShoppingBag className="h-5 w-5 text-green-500" />;
      case 'advertisement':
        return <Megaphone className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const isLoading = useMemo(() => (
    (category === 'product' || selectedType === 'product') ? productsLoading : categoriesLoading
  ), [category, selectedType, productsLoading, categoriesLoading]);
  const hasError = useMemo(() => (
    (category === 'product' || selectedType === 'product') ? productsError : categoriesError
  ), [category, selectedType, productsError, categoriesError]);

  useEffect(() => {
    console.log('[BannerRedirectSelector] State:', {
      category,
      selectedType,
      isLoading,
      hasError,
      productsCount: products.length,
      categoriesCount: categories.length,
      optionsCount: options.length,
    });
  }, [category, selectedType, isLoading, hasError, products, categories, options]);

  if (!category) {
    return (
      <div className={`grid grid-cols-4 items-center gap-4 ${className}`}>
        <Label className="text-right text-muted-foreground">
          Redirect URL *
        </Label>
        <div className="col-span-3">
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                Select a banner category first to configure redirect URL
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">
          Redirect URL *
        </Label>
        <div className="col-span-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon()}
                <Badge variant="outline" className="capitalize">
                  {category} Banner
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {getCategoryDescription()}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Selection */}
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">
          Select Target
        </Label>
        <div className="col-span-3">
          {/* Sub-select for offer/advertisement */}
          {(category === 'offer' || category === 'advertisement') && (
            <div className="mb-3">
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value as 'product' | 'category');
                  onRedirectUrlChange('');
                  if (value === 'product') setPage(1);
                  console.log('[BannerRedirectSelector] Sub-type selected:', value);
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type (product or category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center gap-2 p-3 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Loading {category === 'product' ? 'products' : category === 'category' ? 'categories' : 'options'}...
              </span>
            </div>
          ) : hasError ? (
            <div className="p-3 border border-red-200 rounded-md bg-red-50">
              <p className="text-sm text-red-600">
                Failed to load options. Please try refreshing the page.
              </p>
            </div>
          ) : (category === 'offer' || category === 'advertisement') && !selectedType ? (
            <div className="p-3 border border-amber-200 rounded-md bg-amber-50">
              <p className="text-sm text-amber-700">
                Select a type to continue.
              </p>
            </div>
          ) : options.length === 0 ? (
            <div className="p-3 border border-amber-200 rounded-md bg-amber-50">
              <p className="text-sm text-amber-700">
                No {category === 'product' ? 'products' : category === 'category' ? 'categories' : 'options'} available.
                {category === 'product' && ' Please add some products first.'}
                {category === 'category' && ' Please add some categories first.'}
              </p>
            </div>
          ) : (
            <Select
              value={redirectUrl}
              onValueChange={(value) => {
                onRedirectUrlChange(value);
                console.log('[BannerRedirectSelector] Target selected:', value);
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${category === 'offer' || category === 'advertisement' ? selectedType || 'type' : category}`} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {options.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="py-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {option.icon}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {option.label}
                        </div>
                        {option.sublabel && (
                          <div className="text-xs text-muted-foreground truncate">
                            {option.sublabel}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
                {selectedType === 'product' && hasMore && (
                  <SelectItem
                    value="__SEE_MORE__"
                    className="py-2 text-center text-blue-600 cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      loadMore();
                      console.log('[BannerRedirectSelector] See more clicked');
                    }}
                  >
                    See more
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Selected Item Preview */}
      {redirectUrl && (
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="text-right"></div>
          <div className="col-span-3">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    Selected
                  </Badge>
                  <span className="text-sm font-medium">
                    {options.find(opt => opt.value === redirectUrl)?.label}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Customers will be redirected to this {
                    options.find(opt => opt.value === redirectUrl)?.sublabel?.includes('Product') ? 'product' : 'category'
                  } when they tap the banner.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
