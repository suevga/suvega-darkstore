import { io } from "socket.io-client";
import useOrderStore from '../store/orderStore.js';
import { toast } from "../hooks/use-toast";
import { envConfig } from "./env.config.js";

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
      return;
    }

    this.darkStoreId = darkStoreId;
    this.socket = io(import.meta.env.VITE_SOCKET_URL || envConfig.backendUrl, {
      transports: ["websocket"],
    });

    // Join darkstore room on connection
    this.socket.on("connect", () => {
      console.log("Connected to socket server");
      this.joinDarkStoreRoom(darkStoreId);
    });

    this.setupEventListeners();
  }

  joinDarkStoreRoom(darkStoreId) {
    if (!this.socket || !darkStoreId) return;
    
    this.socket.emit("joinRoom", {
      type: "darkStore",
      id: darkStoreId
    });
    console.log(`Joined darkStore room: darkStore_${darkStoreId}`);
  }

  // Join specific order room
  joinOrderRoom(orderId) {
    if (!this.socket || !orderId) return;
    
    this.socket.emit("joinRoom", {
      type: "order",
      id: orderId
    });
    console.log(`Joined order room: order_${orderId}`);
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("newOrder", (data) => {
      console.log("New order received:", data);
      toast({
        title: "New Order Received",
        description: `Order ID: ${data.orderId}`,
        duration: 5000,
      });
      
      if (data.orderId) {
        // Join the new order's room
        this.joinOrderRoom(data.orderId);
        
        // Fetch and add the new order
        this.fetchAndAddOrder(data.orderId);
        
        toast({
          title: "New Order Received",
          description: `Order ID: ${data.orderId}`,
          duration: 5000,
        });
      }
    });

    this.socket.on("orderStatusUpdate", (data) => {
      console.log("Order status update:", data);
      const { updateOrder } = useOrderStore.getState();
      updateOrder(data.orderId, { orderStatus: data.status });
      
      toast({
        title: "Order Status Updated",
        description: `Order ${data.orderId} status: ${data.status}`,
        duration: 3000,
      });
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  async fetchAndAddOrder(orderId) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/order/${orderId}`);
      const data = await response.json();
      
      if (data.success) {
        const { addOrder } = useOrderStore.getState();
        addOrder(data.data.order);
      }
    } catch (error) {
      console.error('Error fetching new order:', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.darkStoreId = null;
    }
  }
}

export default SocketService;