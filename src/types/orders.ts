
export interface OrderProps {
  _id: string;
  userId: string;
  phoneNumber: string;
  address: AddressProps;
  darkstore: string;
  storename: string;
  location: LocationProps;
  deliveryLocation: LocationProps;
  pickupLocation: LocationProps;
  createdAt: Date;
  updatedAt: Date;
  orderStatus: string;
  riderLocation?: any;
  items: Array<{
    product: string;
    quantity: number;
  }>;
  totalPrice: number;
  deliveryRider?: {
    name: string;
  };
  paymentMethod: string;
}

export interface OrderStoreProps {
  orders: OrderProps[];
  setOrders: (orders: OrderProps[]) => void;
  totalOrderCount: number;
  setTotalOrderCount: (count: number) => void;
  addOrder: (order: OrderProps) => void;
  updateOrder: (orderId: string, updatedOrder: Partial<OrderProps>) => void;
  deleteOrder: (orderId: string) => void;
  getOrdersByStatus: (status: string) => OrderProps[];
  getOrderCounts: () => { delivered: number; rejected: number; cancelled: number };
  clearOrders: () => void;
}

interface LocationProps {
  type: string,
  coordinates: number[],
}

interface AddressProps {
  type: string,
  coordinates: number[],
  address: string,
  city: string,
  state: string,
  country: string,
  pinCode: string,
}
