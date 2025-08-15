import { io, Socket } from 'socket.io-client';
import useOrderStore from '../store/orderStore';
// --- Type Definitions for Socket Events ---
export interface RoomJoinedData {
  room: string;
}

export interface OrderData {
  _id: string;
  orderStatus?: string;
  deliveryRider?: any;
  riderLocation?: RiderLocationData;
  [key: string]: any;
}

export interface SocketEventData {
  orderId?: string;
  order?: OrderData;
  status?: string;
  type?: string;
  message?: string;
  rider?: any;
  [key: string]: any;
}

export interface RiderLocationData {
  orderId: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

export interface AdminNotificationData {
  message: string;
  [key: string]: any;
}
import { toast } from '../hooks/use-toast';
import { envConfig } from './env.config';
import axiosInstance from '../api/axiosInstance';

class SocketService {
  static instance: SocketService | null = null;
  socket: Socket | null = null;
  darkStoreId: string | null = null;
  isConnecting: boolean = false;

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(darkStoreId: string) {
    if (this.isConnecting) {
      return;
    }

    if (this.socket?.connected && this.darkStoreId === darkStoreId) {
      return;
    }

    // Disconnect existing socket if we're reconnecting with a different darkStoreId
    if (this.socket) {
      this.disconnect();
    }

    this.isConnecting = true;
    this.darkStoreId = darkStoreId;

    // Use environment config for server URL when possible
    const socketServerUrl = envConfig.backendUrl || envConfig.socketUrl;

    console.log('socketServerUrl', socketServerUrl);
    // Make sure this port matches your backend server port where socket.io is running
    this.socket = io(socketServerUrl, {
      transports: ['websocket', 'polling'], // Add polling as fallback
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      query: {
        type: 'darkStore',
        darkStoreId: darkStoreId,
      }, // Send identification in query params
    });

    // Join darkstore room on connection
    this.socket.on('connect', () => {
      this.isConnecting = false;
      // Make sure we join the room immediately after connecting
      this.joinDarkStoreRoom(darkStoreId);

      // Notify the server we're ready to receive updates
      this.socket?.emit('darkStoreReady', { darkStoreId });

      // Dispatch an event that we're connected - useful for UI updates
      window.dispatchEvent(new Event('socketConnected'));
    });

    this.socket.on('connect_error', (error: Error) => {
      this.isConnecting = false;
      toast({
        title: 'Connection Error',
        description: `Failed to connect to notification server. Retrying... || ${error.message}`,
        variant: 'destructive',
      });

      // Dispatch event that socket failed to connect
      window.dispatchEvent(new Event('socketConnectError'));
    });

    this.socket.on('roomJoined', (data: RoomJoinedData) => {
      toast({
        title: 'Connected',
        description: `Connected to ${data.room}`,
      });
    });

    this.setupEventListeners();
  }

  joinDarkStoreRoom(darkStoreId: string) {
    if (!this.socket || !darkStoreId) {
      return;
    }

    this.socket.emit('joinRoom', {
      type: 'darkStore',
      id: darkStoreId,
    });
  }

  joinOrderRoom(orderId: string) {
    if (!this.socket || !orderId) {
      return;
    }

    this.socket.emit('joinRoom', {
      type: 'order',
      id: orderId,
    });
  }

  setupEventListeners() {
    if (!this.socket) {
      return;
    }

    // Clear any existing listeners to prevent duplicates
    this.socket.off('newOrderRequest');
    this.socket.off('NEW_ORDER_REQUEST');
    this.socket.off('newOrder');
    this.socket.off('globalNewOrder');
    this.socket.off('orderUpdate');
    this.socket.off('riderLocationUpdate');
    this.socket.off('adminNotification');

    // Listen for new orders with all possible event names
    const newOrderEvents = ['newOrderRequest', 'NEW_ORDER_REQUEST', 'newOrder', 'globalNewOrder'];

    newOrderEvents.forEach(eventName => {
      this.socket?.on(eventName, (data: SocketEventData )=> {
        toast({
          title: 'New Order Received',
          description: `Order ID: ${data.orderId || data.order?._id || 'Unknown'}`,
        });

        const orderId = data.orderId || data.order?._id;
        if (orderId) {
          // Join the new order's room
          this.joinOrderRoom(orderId);

          // Fetch and add the new order
          this.fetchAndAddOrder(orderId);

          // Dispatch a custom event to ensure notification sound plays globally
          // This event will be caught by the GlobalNotificationService
          const notificationEvent = new CustomEvent('newOrderNotification', {
            detail: {
              ...data,
              timestamp: new Date().toISOString(),
            },
          });
          window.dispatchEvent(notificationEvent);
        }
      });
    });

    // Listen for order status updates
    this.socket.on('orderUpdate', (data: SocketEventData )=> {
      const { updateOrder } = useOrderStore.getState();

      if (data.orderId) {
        let updateData:Partial<OrderData> = {};

        if (data.status) {
          updateData.orderStatus = data.status;
        } else if (data.type) {
          // Handle different types of order updates
          switch (data.type) {
            case 'ORDER_ACCEPTED':
              updateData.orderStatus = 'accepted';
              break;
            case 'ORDER_REJECTED':
              updateData.orderStatus = 'rejected';
              break;
            case 'RIDER_ASSIGNED':
              updateData.orderStatus = 'rider_pending';
              updateData.deliveryRider = data.rider;
              break;
            case 'PICKUP':
              updateData.orderStatus = 'pickup';
              break;
            case 'DELIVERED':
              updateData.orderStatus = 'delivered';
              break;
          }
        }

        if (Object.keys(updateData).length > 0) {
          updateOrder(data.orderId, updateData);
        }

        toast({
          title: 'Order Updated',
          description: data.message || `Order ${data.orderId} was updated`,
        });
      }
    });

    // Listen for rider location updates
    this.socket.on('riderLocationUpdate', (data: RiderLocationData )=> {
      if (data.orderId) {
        const { updateOrder } = useOrderStore.getState();
        updateOrder(data.orderId, { riderLocation: data });
      }
    });

    // Listen for admin-specific notifications
    this.socket.on('adminNotification', (data: AdminNotificationData )=> {
      toast({
        title: 'Admin Notification',
        description: data.message,
      });

      // Dispatch a global notification event for this admin notification too
      const notificationEvent = new CustomEvent('adminNotification', {
        detail: {
          ...data,
          timestamp: new Date().toISOString(),
        },
      });
      window.dispatchEvent(notificationEvent);
    });

    this.socket.on('disconnect', (reason: string)=> {
      // Auto-reconnect for certain disconnection reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.socket?.connect();
      }

      // Dispatch event that socket disconnected
      window.dispatchEvent(new Event('socketDisconnected'));
    });

    this.socket.on('error', (error: Error)=> {
      console.error('Socket error:', error);
    });
  }

  async fetchAndAddOrder(orderId: string): Promise<void> {
    try {
      const response = await axiosInstance.get(`/api/v1/order/details/${orderId}`);

      // Check if the response is already JSON
      const data = response.data;

      if (data.success || data.statusCode === 200) {
        const { addOrder, setOrders, orders } = useOrderStore.getState();
        const orderData = data.data?.order || data.data;

        // Check if order already exists to avoid duplicates
        const existingOrder = orders.find((o: OrderData) => o._id === orderData._id);
        if (!existingOrder) {
          addOrder(orderData);

          // Show a toast notification for the fetched order
          toast({
            title: 'New Order Added',
            description: `Order #${orderData._id.slice(-6)} has been added to your list`,
          });
        } else {
          setOrders([...orders.filter((o: OrderData) => o._id !== orderData._id), orderData]);
        }
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch order details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch order details',
        variant: 'destructive',
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.darkStoreId = null;
      this.isConnecting = false;
    }
  }
}

export default SocketService;
