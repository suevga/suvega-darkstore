import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Package, Grid, MoreVertical, Plus, Trash, Edit, Eye } from 'lucide-react'

// Mock data for demonstration
const mockProducts = [
  { id: 1, name: "Smartphone X", description: "Latest model with advanced features", category: "Electronics", quantity: 50, price: 999.99, discountPrice: 899.99, addDate: "2023-05-15", status: "In Stock" },
  { id: 2, name: "Leather Wallet", description: "Handcrafted genuine leather wallet", category: "Accessories", quantity: 100, price: 49.99, discountPrice: null, addDate: "2023-04-20", status: "In Stock" },
  { id: 3, name: "Wireless Earbuds", description: "High-quality sound with long battery life", category: "Electronics", quantity: 75, price: 129.99, discountPrice: 99.99, addDate: "2023-05-01", status: "Low Stock" },
  { id: 4, name: "Yoga Mat", description: "Non-slip, eco-friendly yoga mat", category: "Sports & Fitness", quantity: 0, price: 29.99, discountPrice: null, addDate: "2023-03-10", status: "Out of Stock" },
  { id: 5, name: "Coffee Maker", description: "Programmable coffee maker with thermal carafe", category: "Home & Kitchen", quantity: 30, price: 79.99, discountPrice: 69.99, addDate: "2023-05-10", status: "In Stock" },
]

const categories = [...new Set(mockProducts.map(product => product.category))]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "All" || product.category === selectedCategory)
  )

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      
      {/* Clickable cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockProducts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Grid className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar, category filter, and add product button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input 
            type="search" 
            placeholder="Search products..." 
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border rounded-md p-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Products list table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Discount</TableHead>
              <TableHead className="hidden md:table-cell">Add Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell className="hidden md:table-cell max-w-xs truncate">{product.description}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>${product.price.toFixed(2)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {product.discountPrice ? `$${product.discountPrice.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="hidden md:table-cell">{product.addDate}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      product.status === "In Stock" ? "default" :
                      product.status === "Low Stock" ? "warning" :
                      "destructive"
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

