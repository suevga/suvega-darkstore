import React, { useEffect, useState } from 'react';
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

import { ShoppingBag, CheckCircle, XCircle, Loader2, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from "../components/ui/badge";
import useOrderStore from '../store/orderStore.js';
import { useDarkStore } from '../store/darkStore.js';
import { NotificationCenter } from '../components/NotificationCenter';
import SocketService from "../utility/socket.service.js";
import { useProductStore } from "../store/productStore.js";
import { Button } from '../components/ui/button';
import { toast } from '../hooks/use-toast';
import { useUserStore } from '../store/allUsersStore.js';
import { Pagination } from '../components/ui/pagination.tsx';

const OrdersPage = () => {
  const [loading, setLoading] = useState({
    page: true,
    action: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { 
    orders, 
    setOrders, 
    totalOrderCount, 
    setTotalOrderCount, 
    updateOrder,
    getOrderCounts,
    deleteOrder 
  } = useOrderStore();
  const { products } = useProductStore();
  const { darkstoreId } = useDarkStore();
  const { users } = useUserStore();
  
  useEffect(() => {
    let isSubscribed = true;
    let socketService;
    
    const initializeOrdersAndSocket = async () => {
      if (!darkstoreId) return;

      try {
        await fetchOrders(currentPage);
        socketService = SocketService.getInstance();
        socketService.connect(darkstoreId);

        if (Array.isArray(orders)) {
          orders.forEach(order => {
            socketService.joinOrderRoom(order._id);
          });
        }
      } catch (error) {
        console.error('Error initializing orders and socket:', error);
      }
    };

    initializeOrdersAndSocket();

    return () => {
      isSubscribed = false;
      if (socketService) {
        socketService.disconnect();
      }
    };
  }, [darkstoreId, currentPage]); 

  const fetchOrders = async (page) => {
    if (!darkstoreId) return;
    
    try {
      const response = await axiosInstance.get(`/api/v1/order/allorders/${darkstoreId}?page=${page}&limit=10`);

      if (response.status === 200 && response.data?.data?.orders) {
        const fetchedOrders = response.data.data.orders;
        setOrders(Array.isArray(fetchedOrders) ? fetchedOrders : []);
        setTotalOrderCount(response.data.data.totalOrders);
        setTotalPages(response.data.data.totalPages);
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
      const product = products.find(product => product._id === item.product);
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
      setLoading(prev => ({ ...prev, action: true }));
      const response = await axiosInstance.patch(`/api/v1/order/store-response/${orderId}`, {
        accept: true,
      });
      if (response.status === 200) {
        await fetchOrders(currentPage);
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
  console.log("userId ahise from getUserMethod::", userId);
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

  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) return [];
    
    return orders.filter(order => {
      const searchLower = searchTerm.toLowerCase();
     
      return (
        order._id.toLowerCase().includes(searchLower) ||
        getUserName(order.userId).toLowerCase().includes(searchLower) ||
        (order.deliveryRider?.name || '').toLowerCase().includes(searchLower)
      );
    });
  }, [orders, searchTerm]);

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
 
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <NotificationCenter />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveredOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledOrders}</div>
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
      <div className="rounded-md border">
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
            {filteredOrders.map((order) => (
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
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between px-2">
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