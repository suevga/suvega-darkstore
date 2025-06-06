import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from "../api/axiosInstance.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

import { ShoppingBag, CheckCircle, XCircle, Loader2, Trash2, ChevronRight, ChevronLeft, Bell, Clock } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import useOrderStore from '../store/orderStore.js';
import { useDarkStore } from '../store/darkStore.js';
import { NotificationCenter } from '../components/NotificationCenter';
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import { useUserStore } from '../store/allUsersStore.js';
import { Pagination } from '../components/ui/pagination.tsx';
import SocketService from '../utility/socket.service.js';

const OrdersPage = () => {
  const [loading, setLoading] = useState({
    page: true,
    action: false,
    products: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderProducts, setOrderProducts] = useState({});
  const [activeTab, setActiveTab] = useState("pending");
  const [hasNewNotification, setHasNewNotification] = useState(false);
  
  const { 
    orders, 
    setOrders, 
    totalOrderCount, 
    setTotalOrderCount, 
    updateOrder,
    getOrderCounts,
    deleteOrder,
    addOrder,
    getOrdersByStatus
  } = useOrderStore();
  const { darkstoreId } = useDarkStore();
  const { users } = useUserStore();
  const [socketInitialized, setSocketInitialized] = useState(false);
  
  // Socket connection setup
  useEffect(() => {
    if (!darkstoreId) {
      console.log("darkstoreId not found, can't initialize socket");
      return;
    }
    
    try {
      // Initialize socket connection (the global notification service handles this now)
      const socketService = SocketService.getInstance();
      socketService.connect(darkstoreId);
      setSocketInitialized(true);
      
      // Verify we're connected to the socket server
      console.log("Socket connected status:", socketService.socket?.connected);
      
      // Add global event listener for notification indicator
      const handleNewOrderNotification = () => {
        console.log("Order page: New order notification event received");
        setHasNewNotification(true);
      };
      
      window.addEventListener('newOrderNotification', handleNewOrderNotification);
      
      // If the socket is not connected, try to reconnect every 5 seconds
      const interval = setInterval(() => {
        if (!socketService.socket?.connected) {
          console.log("Socket not connected, attempting to reconnect...");
          socketService.disconnect();
          socketService.connect(darkstoreId);
        }
      }, 5000);
      
      return () => {
        clearInterval(interval);
        // Remove global event listener
        window.removeEventListener('newOrderNotification', handleNewOrderNotification);
        // Keep socket connected when navigating away, don't disconnect
      };
    } catch (error) {
      console.error("Socket initialization error:", error);
    }
  }, [darkstoreId]);

  const fetchOrders = async (page) => {
    if (!darkstoreId) {
      console.log("darkstoreId not found, can't fetch orders");
      return;
    }
    
    setLoading(prev => ({ ...prev, page: true }));
    
    try {
      console.log(`Fetching orders for darkstore ${darkstoreId}, page ${page}`);
      const response = await axiosInstance.get(`/api/v1/order/allorders/${darkstoreId}?page=${page}&limit=10`);

      if (response.status === 200 && response.data?.data?.orders) {
        const fetchedOrders = response.data.data.orders;
        
        // Sort orders by createdAt date (newest first)
        const sortedOrders = Array.isArray(fetchedOrders) 
          ? [...fetchedOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          : [];
          
        setOrders(sortedOrders);
        setTotalOrderCount(response.data.data.totalOrders || 0);
        setTotalPages(response.data.data.totalPages || 1);
        
        console.log(`Fetched ${fetchedOrders.length} orders`);
        
        // Fetch product details for these orders
        await fetchOrderProducts(sortedOrders);
      } else {
        console.warn("Unexpected response format:", response.data);
        toast({
          title: "Warning",
          description: "Received unexpected data format from server",
          variant: "warning",
        });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setTotalOrderCount(0);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };
  
  const fetchOrderProducts = async (fetchedOrders) => {
    if (!fetchedOrders || !fetchedOrders.length) return;
    
    try {
      setLoading(prev => ({ ...prev, products: true }));
      
      // Collect all product IDs from all orders
      const productIds = new Set();
      fetchedOrders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item.product) productIds.add(item.product);
          });
        }
      });
      
      // Fetch products in bulk
      if (productIds.size > 0) {
        const productIdsArray = Array.from(productIds);
        console.log(`Fetching details for ${productIdsArray.length} products`);
        
        const response = await axiosInstance.post('/api/v1/product/get-products-by-ids', {
          productIds: productIdsArray
        });
        
        if (response.status === 200 && response.data?.data) {
          const productsData = response.data.data;
          const productMap = {};
          
          // Create a map for quick lookup
          productsData.forEach(product => {
            productMap[product._id] = product;
          });
          
          setOrderProducts(productMap);
          console.log(`Loaded details for ${productsData.length} products`);
        } else {
          console.warn("Unexpected product response format:", response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching order products:', error);
      toast({
        title: "Warning",
        description: "Could not load all product details",
        variant: "warning",
      });
    } finally {
      setLoading(prev => ({ ...prev, products: false }));
    }
  };
  
  const handleOrderDelete = async (orderId) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const response = await axiosInstance.delete(`/api/v1/order/delete-order/${orderId}`);
          
      if (response.status === 200) {
        deleteOrder(orderId);
        toast({
          title: "Success",
          description: "Order deleted successfully",
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Error",
        description: "Failed to delete order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const getProductNames = (items) => {
    if (!items || !Array.isArray(items)) return 'N/A';
    
    return items.map(item => {
      const product = orderProducts[item.product];
      if (product) {
        return `${product.productName} (${item.quantity}x)`;
      }
      return 'Unknown Product';
    }).join(', ');
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const response = await axiosInstance.patch(`/api/v1/order/status/${orderId}`, { 
        status: newStatus 
      });

      if (response.status === 200) {
        const updatedOrder = response.data.data.order;
        updateOrder(orderId, updatedOrder);
        
        const { delivered, cancelled } = getOrderCounts();
        setTotalOrderCount(orders.length);

        toast({
          title: "Status Updated",
          description: `Order status updated to ${newStatus}`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      console.log('Accepting order:', orderId);
      
      setLoading(prev => ({ ...prev, action: true }));
      const response = await axiosInstance.patch(`/api/v1/order/store-response/${orderId}`, {
        accept: true,
      });

      console.log("response after accepting order", response);
      
      if (response.status === 200) {
        const updatedOrder = { 
          ...orders.find(o => o._id === orderId),
          orderStatus: 'accepted'
        };
        updateOrder(orderId, updatedOrder);
        
        toast({
          title: "Order Accepted",
          description: "Order has been accepted successfully.",
          variant: "success",
        });
        
        // Refresh the orders list to get the latest status
        await fetchOrders(currentPage);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleRejectOrder = async (orderId) => {
    try {
      
      setLoading(prev => ({ ...prev, action: true }));
      const response = await axiosInstance.patch(`/api/v1/order/store-response/${orderId}`, {
        accept: false
      });
      if (response.status === 200) {
        const updatedOrder = { 
          ...orders.find(o => o._id === orderId),
          orderStatus: 'cancelled'
        };
        updateOrder(orderId, updatedOrder);
        deleteOrder(orderId);
        
        toast({
          title: "Order Rejected",
          description: "Order has been rejected.",
          variant: "info",
        });
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: "Error",
        description: "Failed to reject order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800"
    };

    return (
      <Badge className={`${statusStyles[status]} px-2 py-1 rounded-full`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getUserName = (userId) => {
    if (!userId || !userId._id) return 'Unknown User';
    const extractId = userId._id;
    const user = users.find(user => user._id === extractId);
    if (!user || !user.address || !user.address.length) return 'Unknown User';
    const primaryAddress = user.address[0];
    return primaryAddress.fullName || 'Unknown User';
  };
  
  const getUserAddress = (userId) => {
    if (!userId || !userId._id) return 'Unknown Address';
    const extractId = userId._id;
    const user = users.find(user => user._id === extractId);
    if (!user || !user.address || !user.address.length) return 'Unknown Address';
    const primaryAddress = user.address[0];
    return `${primaryAddress.addressLine}, ${primaryAddress.city}, ${primaryAddress.pinCode}, ${primaryAddress.landmark ? primaryAddress.landmark:" "}`;
  };

  const getOrderData = (status) => {
    // Filter orders based on status
    return orders.filter(order => {
      if (status === "pending") {
        return order.orderStatus === "pending";
      } else if (status === "processing") {
        return ["accepted", "pickup"].includes(order.orderStatus);
      } else if (status === "delivered") {
        return order.orderStatus === "delivered";
      } else if (status === "cancelled") {
        return order.orderStatus === "cancelled" || order.orderStatus === "rejected";
      }
      return true;
    });
  };

  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    // First filter by tab/status
    const statusFiltered = getOrderData(activeTab);
    
    // Then filter by search term
    return statusFiltered.filter(order => {
      const searchLower = searchTerm.toLowerCase();
     
      return (
        order._id.toLowerCase().includes(searchLower) ||
        getUserName(order.userId).toLowerCase().includes(searchLower) ||
        (order.deliveryRider?.name || '').toLowerCase().includes(searchLower)
      );
    });
  }, [orders, searchTerm, users, activeTab]);

  const { delivered: deliveredOrders, cancelled: cancelledOrders } = getOrderCounts();


  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true,
      timeZone: 'Asia/Kolkata'
    };
    return new Date(dateString).toLocaleString('en-IN', options);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleRefresh = () => {
    fetchOrders(currentPage);
  };
 
  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, darkstoreId]);
  
  // Clear notification indicator when opening notification center
  const handleNotificationClick = () => {
    setHasNewNotification(false);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <div className="flex items-center space-x-4">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            Refresh Orders
          </Button>
          <div className="relative">
            {hasNewNotification && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
            <div onClick={handleNotificationClick}>
              <NotificationCenter />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrderCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <div className="relative">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {getOrderData("pending").length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderData("pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Orders</CardTitle>
            <div className="relative">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {getOrderData("accepted").length > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderData("accepted").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderData("delivered").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getOrderData("cancelled").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Input 
          type="search" 
          placeholder="Search by Order ID, Customer, or Rider..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {getOrderData("pending").length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {getOrderData("pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted" className="relative">
            Processing
            {getOrderData("accepted").length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs text-white">
                {getOrderData("accepted").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <div className="rounded-md border">
          {loading.page || loading.products ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p>Loading orders...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Time</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Rider</TableHead>
                  <TableHead>Order Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No {activeTab} orders found. 
                      {!socketInitialized && (
                        <div className="mt-2 text-sm text-yellow-600">
                          Socket not connected. Notifications may not work.
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{getUserName(order.userId)}</TableCell>
                      <TableCell>{getUserAddress(order.userId)}</TableCell>
                      <TableCell>{getProductNames(order.items)}</TableCell>
                      <TableCell>₹{order.totalPrice}</TableCell>
                      <TableCell>{order.deliveryRider?.name || 'Not Assigned'}</TableCell>
                      <TableCell>
                        {order.orderStatus === 'pending' ? (
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleAcceptOrder(order._id)}
                              disabled={loading.action}
                              size="sm"
                            >
                              Accept
                            </Button>
                            <Button 
                              onClick={() => handleRejectOrder(order._id)}
                              variant="destructive"
                              disabled={loading.action}
                              size="sm"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <Select
                            value={order.orderStatus}
                            onValueChange={(value) => handleStatusChange(order._id, value)}
                            disabled={!['pickup'].includes(order.orderStatus)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pickup">Pickup</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                      <TableCell>{order.paymentMethod}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {loading.action ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOrderDelete(order._id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </Tabs>

      <div className="flex items-center justify-between px-2 mt-4">
        <div className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;