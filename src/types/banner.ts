export interface Banner {
  _id: string;
  name: string;
  image?: string;
  category: 'offer' | 'product' | 'category' | 'advertisement' | string;
  tags?: string[];
  isActive: boolean;
  redirectUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}


