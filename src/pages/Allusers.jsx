import axiosInstance from "../api/axiosInstance";
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
import { Users, TrendingUp } from 'lucide-react'
import { useDarkStore } from "../store/darkStore";
import { useEffect } from "react";
import { useUserStore } from "../store/allUsersStore.js"
 

export default function AllUsersPage() {
  const { darkstoreId } = useDarkStore()
  console.log("darkstoreId::", darkstoreId);

  const { setUsers, users } = useUserStore();

  console.log("users lists before fetching::", users);

  const fetchUsers = async () => {
    // Fetch users from the server
    try {
      const response = await axiosInstance.get(`/api/v1/users/userlists/${darkstoreId}`)
      if (response.status === 200) {
        // Set the users in the state
        setUsers(response.data.data.users);
      }
    } catch (error) {
      console.log("error fetching users", error);
    }
  }
  console.log("users lists after fetching::", users);
  
  useEffect(() => {
    if (darkstoreId) {
      fetchUsers()
    }
  }, [darkstoreId])
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
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Users (30 days)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
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
          {
            users.map((user)=> (
              <TableRow key={user.id}>
              <TableCell>{user._id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.phoneNumber}</TableCell>
              <TableCell>{user.orderedProducts}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            ))
          }
        </TableBody>
      </Table>
    </div>
  )
}

