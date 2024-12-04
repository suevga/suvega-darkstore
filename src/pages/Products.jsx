import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table.tsx'
import { Input } from '../components/ui/input.tsx'
import { Button } from '../components/ui/button.tsx'


const products = [
  { id: '1', name: 'Product A', sku: 'SKU001', stock: 50, price: '$19.99' },
  { id: '2', name: 'Product B', sku: 'SKU002', stock: 25, price: '$29.99' },
  { id: '3', name: 'Product C', sku: 'SKU003', stock: 100, price: '$9.99' },
  { id: '4', name: 'Product D', sku: 'SKU004', stock: 75, price: '$14.99' },
]

export default function ProductsPage() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Inventory</h1>
      <div className="mb-4 flex justify-between">
        <Input className="w-64" placeholder="Search products..." />
        <Button>Add New Product</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product Name</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.sku}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2">
                  Edit
                </Button>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}