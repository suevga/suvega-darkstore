// Global type declarations for the project

// Declare global environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    VITE_CLERK_PUBLISHABLE_KEY: string;
    // Add other environment variables as needed
  }
}

// Common types used across the application

// User type
interface User {
  id: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  address?: Array<{
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    fullName?: string;
    addressLine?: string;
    landmark?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  // Add other user properties as needed
}

// Product type
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  // Add other product properties as needed
}

// Category type
interface Category {
  _id: string;
  categoryName: string;
  // Add other category properties as needed
}

// Order type
interface Order {
  _id: string;
  userId?: string;
  products: Array<{ productId: string; quantity: number }>;
  status: string;
  // Add other order properties as needed
}

// Banner type
interface Banner {
  _id: string;
  name: string;
  category?: string;
  tags?: string | string[];
  image?: string;
  isActive?: boolean;
  // Add other banner properties as needed
}

// Extend window with any global variables
declare global {
  interface Window {
    // Add any global window properties here
  }
}
