import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Users, TrendingUp, ShoppingBag } from 'lucide-react'

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: "John Doe", phone: "+1 234 567 890", orderedProducts: 5 },
  { id: 2, name: "Jane Smith", phone: "+1 234 567 891", orderedProducts: 3 },
  { id: 3, name: "Bob Johnson", phone: "+1 234 567 892", orderedProducts: 7 },
  { id: 4, name: "Alice Williams", phone: "+1 234 567 893", orderedProducts: 2 },
  { id: 5, name: "Charlie Brown", phone: "+1 234 567 894", orderedProducts: 4 },
]

export default function AllUsersPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      
      {/* Clickable cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Users (30 days)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <Input type="search" placeholder="Search users..." className="max-w-sm" />
      </div>

      {/* Users list table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Ordered Products</TableHead>
            <TableHead>Last Order Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>{user.orderedProducts}</TableCell>
              <TableCell>{new Date().toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

