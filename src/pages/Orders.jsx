import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx'
import { Badge } from '../components/ui/badge.tsx'
import { Button } from '../components/ui/button.tsx'

const orders = [
  { id: '1', customer: 'John Doe', total: '$45.50', status: 'Processing' },
  { id: '2', customer: 'Jane Smith', total: '$32.00', status: 'Shipped' },
  { id: '3', customer: 'Bob Johnson', total: '$78.90', status: 'Delivered' },
  { id: '4', customer: 'Alice Brown', total: '$22.30', status: 'Processing' },
]

export default function OrdersPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customer}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    order.status === 'Delivered'
                      ? 'success'
                      : order.status === 'Shipped'
                      ? 'warning'
                      : 'default'
                  }
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}

