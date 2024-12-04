import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { ShoppingBag, CheckCircle, XCircle } from 'lucide-react'

// Mock data for demonstration
const mockOrders = [
  { id: 1, products: "Smartphone, Laptop", orderedBy: "John Doe", deliveredBy: "Alice Smith", status: "Delivered", paymentMethod: "Credit Card" },
  { id: 2, products: "Headphones", orderedBy: "Jane Smith", deliveredBy: null, status: "Processing", paymentMethod: "PayPal" },
  { id: 3, products: "Tablet, Case", orderedBy: "Bob Johnson", deliveredBy: "Charlie Brown", status: "Delivered", paymentMethod: "Debit Card" },
  { id: 4, products: "Smart Watch", orderedBy: "Alice Williams", deliveredBy: null, status: "Cancelled", paymentMethod: "Cash on Delivery" },
  { id: 5, products: "Wireless Earbuds", orderedBy: "Charlie Brown", deliveredBy: null, status: "Processing", paymentMethod: "Credit Card" },
]

export default function OrdersPage() {
  const totalOrders = mockOrders.length
  const deliveredOrders = mockOrders.filter(order => order.status === "Delivered").length
  const cancelledOrders = mockOrders.filter(order => order.status === "Cancelled").length

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      
      {/* Clickable cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
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

      {/* Search bar */}
      <div className="mb-6">
        <Input type="search" placeholder="Search orders..." className="max-w-sm" />
      </div>

      {/* Orders list table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Ordered Products</TableHead>
            <TableHead>Ordered By</TableHead>
            <TableHead>Delivered By</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.products}</TableCell>
              <TableCell>{order.orderedBy}</TableCell>
              <TableCell>{order.deliveredBy || '-'}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.paymentMethod}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

