import React, { useEffect, useState } from 'react';
import axiosInstance from "../api/axiosInstance.js";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.tsx";
import { Input } from "../components/ui/input.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.tsx";

import { ShoppingBag, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from "../components/ui/badge.tsx";
import useOrderStore from '../store/orderStore.js';
import { useDarkStore } from '../store/darkStore.js';
import { NotificationCenter } from '../components/NotificationCenter.jsx';
import SocketService from "../utility/socket.service.js";
import { useProductStore } from "../store/productStore.js";
import { Button } from '../components/ui/button.tsx';
import { toast } from '../hooks/use-toast.ts';

const OrdersPage = () => {
  const [loading, setLoading] = useState({
    page: true,
    action: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { orders, setOrders, totalOrderCount, setTotalOrderCount } = useOrderStore();
  const { products } = useProductStore();
  const { darkstoreId } = useDarkStore();

  console.log("my orders::", orders);
  

  useEffect(() => {
    let socketService;
    
    const initializeOrdersAndSocket = async () => {
      if (!darkstoreId) return;

      try {
        // first fetch orders
        await fetchOrders();

        // Then connect socket and join rooms for existing orders
        socketService = SocketService.getInstance();
        socketService.connect(darkstoreId);

         // Join rooms for existing orders
         orders.forEach(order => {
          socketService.joinOrderRoom(order._id);
        });

      } catch (error) {
        console.error('Error initializing orders and socket:', error);
      }
    };

    initializeOrdersAndSocket();

    return () => {
      if (socketService) {
        socketService.disconnect();
      }
    };
    
  }, [darkstoreId]); 

  const fetchOrders = async () => {
    if (!darkstoreId) return;
    
    try {
      const response = await axiosInstance.get(`/api/v1/order/allorders/${darkstoreId}`);

      if (response.status === 200 && response.data?.data?.orders) {
        const fetchOrders = response.data.data.orders;
        setOrders(fetchOrders);
        setTotalOrderCount(fetchOrders.length);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, page: false }));
    }
  };

  const getProductNames = (items) => {
    if (!items || !Array.isArray(items)) return 'N/A';
    console.log("items", items);
    
    return items.map(item => {
      const product = products.find(product => product._id === item.product);
      if (product) {
        return `${product.productName}  (${item.quantity}x)`;
      }
      return 'Unknown Product';
    }).join(', ');
  };
  
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setLoading(prev => ({ ...prev, action: true }));
      const response = await axiosInstance.patch(`/api/v1/order/status/${orderId}`, { status: newStatus });

      if (response.status === 200) {
        console.log("response.data.data.order status", response.data.data.order);
        
        await fetchOrders();

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
        await fetchOrders();
        toast({
          title: "Order Accepted",
          description: `Order has been accepted successfully.`,
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
        // Remove the rejected order from the state
        setOrders(prevOrders => {
          if (!Array.isArray(prevOrders)) {
            return [];
          }
          return prevOrders.filter(order => order._id !== orderId);
        });
        
        setTotalOrderCount(prev => prev - 1);
        
        toast({
          title: "Order Rejected",
          description: `Order has been rejected.`,
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

  const filteredOrders = React.useMemo(() => {
    if (!Array.isArray(orders)) {
      console.error('Orders is not an array:', orders);
      return [];
    }
    
    return orders.filter(order => 
      order?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order?.deliveryRider?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orders, searchTerm]);

  const getOrderCounts = () => {
    if (!Array.isArray(orders)) return { delivered: 0, cancelled: 0 };
    
    return orders.reduce((acc, order) => {
      if (order.orderStatus === 'delivered') acc.delivered++;
      if (order.orderStatus === 'cancelled') acc.cancelled++;
      return acc;
    }, { delivered: 0, cancelled: 0 });
  };
  const { delivered: deliveredOrders, cancelled: cancelledOrders } = getOrderCounts();

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
              <TableHead>Customer Name</TableHead>
              <TableHead>Items Count</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Rider</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
          {filteredOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.userId?.name || 'N/A'}</TableCell>
                <TableCell>{order.items.length} items</TableCell>
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
                      defaultValue={order.orderStatus}
                      onValueChange={(value) => handleStatusChange(order._id, value)}
                      disabled={!['pickup', 'pending'].includes(order.orderStatus)}
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
                <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>
                  {loading.action && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
    </div>
  );
};

export default OrdersPage;