import axiosInstance from '../api/axiosInstance';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Users,
  TrendingUp
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useDarkStore } from '../store/darkStore';
import { useEffect, useState, useMemo } from 'react';
import { useUserStore } from '../store/allUsersStore';
import { useToast } from '../hooks/use-toast';

export default function AllUsersPage() {
  const { darkstoreId } = useDarkStore();
  console.log('darkstoreId::', darkstoreId);

  const { setUsers, users } = useUserStore();

  console.log('users lists before fetching::', users);

  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');


  const fetchUsers = async () => {
    if (!darkstoreId) {
      toast({
        title: 'Error',
        description: 'No darkstore ID found',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/v1/users/userlists/${darkstoreId}`);
      if (response.status === 200) {
        // Set the users in the state
        setUsers(response.data.data.users);
        toast({
          title: 'Success',
          description: 'Users fetched successfully',
        });
      }
    } catch (error) {
      console.log('error fetching users', error);
      const errorMessage = error instanceof Error ? error.message : 'Error fetching users';
      toast({
        title: 'Error',
        description: errorMessage || 'Error fetching users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  console.log('users lists after fetching::', users.map(u => u.address));

  // Enhanced search filter - now includes email and better name/phone search
  const filteredUsers = users.filter(
    user => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = user.address && user.address.length > 0 && user.address[0].fullName 
        ? user.address[0].fullName.toLowerCase() 
        : '';
      
      return (
        fullName.includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.includes(searchTerm) ||
        user._id?.includes(searchTerm)
      );
    }
  );

  // Sample data for charts (you can replace with real user analytics)
  const userRegistrationTrend = useMemo(() => [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 140 },
    { month: 'Mar', users: 135 },
    { month: 'Apr', users: 180 },
    { month: 'May', users: 165 },
    { month: 'Jun', users: 200 },
  ], []);

  const userActivityData = useMemo(() => [
    { name: 'Active Users', value: Math.floor(users.length * 0.7), fill: '#10b981' },
    { name: 'Inactive Users', value: Math.floor(users.length * 0.3), fill: '#ef4444' },
  ], [users.length]);

  const locationDistribution = useMemo(() => {
    const locations: Record<string, number> = {};
    users.forEach(user => {
      if (user.address && user.address.length > 0 && user.address[0].city) {
        const city = user.address[0].city;
        locations[city] = (locations[city] || 0) + 1;
      }
    });
    
    return Object.entries(locations)
      .map(([city, count]) => ({ city, users: count as number }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 6);
  }, [users]);

  const recentUsersCount = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return users.filter(user => {
      if (!user?.createdAt) return false;
      const userCreatedAt = new Date(user.createdAt);
      return userCreatedAt >= thirtyDaysAgo;
    }).length;
  }, [users]);

  useEffect(() => {
    if (darkstoreId) {
      fetchUsers();
    }
  }, [darkstoreId]);

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
            <div className="text-2xl font-bold">{recentUsersCount}</div>
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
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Demographics Pie Chart */}
         
      {/* User Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* User Activity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userActivityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {userActivityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Registration Trend */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">User Registration Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userRegistrationTrend}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip formatter={(value) => [value, 'Users']} />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Location Distribution */}
        {locationDistribution.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top Cities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="city" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip formatter={(value) => [value, 'Users']} />
                    <Bar dataKey="users" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/*Users list table */}
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead>User ID</TableHead> */}
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Registered Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <TableRow key={user._id}>
                  {/* <TableCell className="font-medium">{user._id}</TableCell> */}
                  <TableCell>
                    {(user.address && user.address.length > 0 && user.address[0].fullName) || 'N/A'}
                  </TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.address && user.address.length > 0 && user.address[0].city},
                    {user.address && user.address.length > 0 && user.address[0].addressLine},
                    {user.address && user.address.length > 0 && user.address[0].pinCode}
                  </TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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
  );
}
