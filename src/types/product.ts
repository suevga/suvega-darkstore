

export interface ProductProps {
  products: Product[],
  totalProducts: number,
  setProducts: (products: Product[]) => void,
  setTotalProducts: (count: number) => void,
  clearProducts: () => void;
}

export interface Product {
  _id: string,
  productName: string,
  description: string,
  categoryId: string | {
    categoryName: string;
  },
  storeId: string,
  price: number,
  discountPrice: number,
  quantity: number,
  stock: number,
  minimumStockAlert: number,
  stockStatus: string,
  productImages: Images[],
  status: string,
  createdAt: Date,
  updatedAt: Date,
  productId?: string,
  product?: {
    productName: string;
    price: number;
    discountPrice: number;
    category?: {
      categoryName: string;
    };
  };
  category?: {
    categoryName: string;
  };
}

interface Images {
  _id: string,
  imageUrl: string
}