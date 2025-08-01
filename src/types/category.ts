export interface CategoryProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  totalCategoryCount: number;
  setTotalCategoryCount: (count: number) => void;
  clearCategories: () => void;
}

interface Category {
  _id: string,
  categoryName: string,
  description: string,
  storeId: string,
  productCount: number,
  featuredImage: string,
  status: string,
  createdAt: Date,
  updatedAt: Date
}