import { PlusCircle, Search, Package2, Grid2X2 } from 'lucide-react'

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Badge } from "../components/ui/badge"

export default function CategoriesPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Grid2X2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,575</div>
            <p className="text-xs text-muted-foreground">
              +20 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,000</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search categories..." className="pl-8" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by darkstore" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Darkstores</SelectItem>
              <SelectItem value="ds1">Darkstore 1</SelectItem>
              <SelectItem value="ds2">Darkstore 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full md:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Total Products</TableHead>
              <TableHead>Darkstore ID</TableHead>
              <TableHead>Added Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">#{category.id}</TableCell>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.totalProducts}</TableCell>
                <TableCell>DS-{category.darkstoreId}</TableCell>
                <TableCell>{category.addedDate}</TableCell>
                <TableCell>
                  <Badge
                    variant={category.status === "active" ? "default" : "secondary"}
                  >
                    {category.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900 hover:bg-red-50">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Sample data
const categories = [
  {
    id: "CAT001",
    name: "Groceries",
    totalProducts: 450,
    darkstoreId: "001",
    addedDate: "2024-01-15",
    status: "active",
  },
  {
    id: "CAT002",
    name: "Electronics",
    totalProducts: 320,
    darkstoreId: "002",
    addedDate: "2024-01-16",
    status: "active",
  },
  {
    id: "CAT003",
    name: "Fashion",
    totalProducts: 280,
    darkstoreId: "001",
    addedDate: "2024-01-17",
    status: "inactive",
  },
  {
    id: "CAT004",
    name: "Home & Kitchen",
    totalProducts: 525,
    darkstoreId: "003",
    addedDate: "2024-01-18",
    status: "active",
  },
  {
    id: "CAT005",
    name: "Beauty",
    totalProducts: 190,
    darkstoreId: "002",
    addedDate: "2024-01-19",
    status: "active",
  },
]

