import { io } from "socket.io-client";
import useOrderStore from '../store/orderStore.js';
import { toast } from "../hooks/use-toast";
import { envConfig } from "./env.config.js";
import axiosInstance from "../api/axiosInstance.js";

class SocketService {
  static instance = null;
  socket = null;
  darkStoreId = null;

  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(darkStoreId) {
    if (this.socket?.connected && this.darkStoreId === darkStoreId) {
      console.log("Already connected to socket with darkStoreId:", darkStoreId);
      return;
    }

    // Disconnect existing socket if we're reconnecting with a different darkStoreId
    if (this.socket) {
      console.log("Disconnecting existing socket before reconnecting");
      this.disconnect();
    }

    this.darkStoreId = darkStoreId;
    console.log("Connecting to socket server with darkStoreId:", darkStoreId);
    
    // Make sure this port matches your backend server port where socket.io is running
    this.socket = io(envConfig.backendUrl, {
      transports: ["websocket", "polling"], // Add polling as fallback
      reconnection: true,
      reconnectionAttempts: 10, // Increased from 5
      reconnectionDelay: 1000,
      query: { 
        type: "darkStore", 
        darkStoreId: darkStoreId 
      } // Send identification in query params
    });

    // Join darkstore room on connection
    this.socket.on("connect", () => {
      console.log("Connected to socket server with ID:", this.socket.id);
      // Make sure we join the room immediately after connecting
      this.joinDarkStoreRoom(darkStoreId);
      
      // Debug: Check socket connection status
      console.log("Socket connected:", this.socket.connected);
      console.log("Active transport:", this.socket.io.engine.transport.name);
      
      // Notify the server we're ready to receive updates
      this.socket.emit('darkStoreReady', { darkStoreId });
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to notification server. Retrying...",
        variant: "destructive",
      });
    });

    this.socket.on("roomJoined", (data) => {
      console.log("Successfully joined room:", data.room);
      toast({
        title: "Connected",
        description: `Connected to ${data.room}`
      });
    });

    this.setupEventListeners();
  }

  joinDarkStoreRoom(darkStoreId) {
    if (!this.socket || !darkStoreId) {
      console.warn("Cannot join room: Socket or darkStoreId is missing");
      return;
    }
    
    console.log(`Attempting to join darkStore room: darkStore_${darkStoreId}`);
    this.socket.emit("joinRoom", {
      type: "darkStore",
      id: darkStoreId
    });
  }

  joinOrderRoom(orderId) {
    if (!this.socket || !orderId) {
      console.warn("Cannot join order room: Socket or orderId is missing");
      return;
    }
    
    this.socket.emit("joinRoom", {
      type: "order",
      id: orderId
    });
    console.log(`Joined order room: order_${orderId}`);
  }

  setupEventListeners() {
    if (!this.socket) {
      console.warn("Cannot setup event listeners: Socket is missing");
      return;
    }

    // Debug helper function
    const logEvent = (eventName, data) => {
      console.log(`Event received [${eventName}]:`, data);
    };

    // Clear any existing listeners to prevent duplicates
    this.socket.off("newOrderRequest");
    this.socket.off("NEW_ORDER_REQUEST");
    this.socket.off("newOrder");
    this.socket.off("globalNewOrder");
    this.socket.off("orderUpdate");
    this.socket.off("riderLocationUpdate");
    this.socket.off("adminNotification");

    // Listen for new orders with all possible event names
    const newOrderEvents = ["newOrderRequest", "NEW_ORDER_REQUEST", "newOrder", "globalNewOrder"];
    
    newOrderEvents.forEach(eventName => {
      this.socket.on(eventName, (data) => {
        logEvent(eventName, data);
        
        toast({
          title: "New Order Received",
          description: `Order ID: ${data.orderId || (data.order?._id || 'Unknown')}`
        });
        
        const orderId = data.orderId || (data.order?._id);
        if (orderId) {
          // Join the new order's room
          this.joinOrderRoom(orderId);
          
          // Fetch and add the new order
          this.fetchAndAddOrder(orderId);
        }
      });
    });

    // Listen for order status updates
    this.socket.on("orderUpdate", (data) => {
      logEvent("orderUpdate", data);
      const { updateOrder } = useOrderStore.getState();
      
      if (data.orderId) {
        let updateData = {};
        
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
          title: "Order Updated",
          description: data.message || `Order ${data.orderId} was updated`,
        });
      }
    });

    // Listen for rider location updates
    this.socket.on("riderLocationUpdate", (data) => {
      logEvent("riderLocationUpdate", data);
      if (data.orderId) {
        const { updateOrder } = useOrderStore.getState();
        updateOrder(data.orderId, { riderLocation: data });
      }
    });

    // Listen for admin-specific notifications
    this.socket.on("adminNotification", (data) => {
      logEvent("adminNotification", data);
      toast({
        title: "Admin Notification",
        description: data.message,
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server. Reason:", reason);
      
      // Auto-reconnect for certain disconnection reasons
      if (reason === "io server disconnect" || reason === "transport close") {
        console.log("Attempting to reconnect...");
        this.socket.connect();
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  async fetchAndAddOrder(orderId) {
    try {
      console.log("Fetching order details for:", orderId);
      const response = await axiosInstance.get(`/api/v1/order/details/${orderId}`);
      
      // Check if the response is already JSON
      const data = response.data;
      console.log("log after fetching order", data);
      
      if (data.success || data.statusCode === 200) {
        const { addOrder, setOrders, orders } = useOrderStore.getState();
        const orderData = data.data?.order || data.data;
        console.log("Adding order to store:", orderData);
        
        // Check if order already exists to avoid duplicates
        const existingOrder = orders.find(o => o._id === orderData._id);
        if (!existingOrder) {
          addOrder(orderData);
          
          // Show a toast notification for the fetched order
          toast({
            title: "New Order Added",
            description: `Order #${orderData._id.slice(-6)} has been added to your list`,
          });
        } else {
          console.log("Order already exists in store, updating instead");
          setOrders([...orders.filter(o => o._id !== orderData._id), orderData]);
        }
      } else {
        console.error("Error response from API:", data);
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching new order:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket");
      this.socket.disconnect();
      this.socket = null;
      this.darkStoreId = null;
    }
  }
}

export default SocketService;