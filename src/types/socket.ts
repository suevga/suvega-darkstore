// Define interfaces for better type safety
interface OrderData {
  _id: string;
  orderId?: string;
  orderStatus?: string;
  deliveryRider?: any;
  riderLocation?: any;
}

interface SocketEventData {
  orderId?: string;
  order?: OrderData;
  status?: string;
  type?: string;
  message?: string;
  rider?: any;
}

interface RiderLocationData {
  orderId: string;
  [key: string]: any;
}

interface AdminNotificationData {
  message: string;
  [key: string]: any;
}

interface RoomJoinedData {
  room: string;
}

interface OrderResponse {
  success?: boolean;
  statusCode?: number;
  data?: {
    order?: OrderData;
  } | OrderData;
}
