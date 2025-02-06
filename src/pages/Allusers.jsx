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
import { useEffect, useState } from "react";
import { useUserStore } from "../store/allUsersStore.js"
import { useToast } from "../hooks/use-toast";

export default function AllUsersPage() {
  const { darkstoreId } = useDarkStore()
  console.log("darkstoreId::", darkstoreId);

  const { setUsers, users } = useUserStore();

  console.log("users lists before fetching::", users);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    if (!darkstoreId) {
      toast({
        title: "Error",
        description: "No darkstore ID found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/v1/users/userlists/${darkstoreId}`)
      if (response.status === 200) {
        // Set the users in the state
        setUsers(response.data.data.users);
        toast({
          title: "Success",
          description: "Users fetched successfully"
        });
      }
    } catch (error) {
      console.log("error fetching users", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Error fetching users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }
  console.log("users lists after fetching::", users.address);
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phoneNumber?.includes(searchTerm) ||
    user._id?.includes(searchTerm)
  );


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
        <Input 
        type="search" 
        placeholder="Search users..." 
        className="max-w-sm" 
        value={searchTerm}
        onChange={(e)=> setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users list table */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user._id}</TableCell>
                  <TableCell>{(user.address && user.address.length > 0 && user.address[0].fullName) || 'N/A'}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{(user.address && user.address.length > 0 && user.address[0].city)},
                  {(user.address && user.address.length > 0 && user.address[0].addressLine)},
                  {(user.address && user.address.length > 0 && user.address[0].pinCode)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

