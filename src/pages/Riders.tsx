import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Users,
  ClipboardList,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  User,
  Mail,
  Phone,
  Truck,
  CreditCard,
  Calendar,
  MapPin
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
import axiosInstance from '../api/axiosInstance';
import { useDarkStore } from '../store/darkStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAllRiderStore } from '../store/allRiderStore';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';

export default function RidersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { darkstoreId } = useDarkStore();
  const {
    allRiders,
    setAllRiders,
    setTotalRiders,
    addRejectedRider,
    getRejectedCount,
    rejectedRiders,
  } = useAllRiderStore();
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  console.log('reject reason::', rejectReason);

  useEffect(() => {
    const getRiders = async () => {
      try {
        const response = await axiosInstance.get(`/api/v1/rider/get-all-riders/${darkstoreId}`);
        if (response.status === 200) {
          console.log('get rider list in verify rider page::', response.data);
          // Ensure we're storing an array
          const ridersData = Array.isArray(response.data)
            ? response.data
            : response.data && response.data.riders
              ? response.data.riders
              : [];
          setAllRiders(ridersData);
          setTotalRiders(ridersData.length);
        }
      } catch (error) {
        console.log('error in get rider list in verify rider page::', error);
      }
    };
    getRiders();
  }, [darkstoreId, setAllRiders, setTotalRiders]);

  // Ensure allRiders is an array before filtering
  const filteredRiders = Array.isArray(allRiders)
    ? allRiders.filter(
        rider =>
          (rider.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            rider.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (statusFilter === 'all' ||
            (statusFilter === 'active' && rider.isAvailable === true) ||
            (statusFilter === 'inactive' && rider.isAvailable === false) ||
            (statusFilter === 'pending' && rider.isApproved === false) ||
            (statusFilter === 'verified' && rider.isApproved === true))
      )
    : [];

  // Filter rejected riders
  const filteredRejectedRiders = Array.isArray(rejectedRiders)
    ? rejectedRiders.filter(
        rider =>
          rider.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rider.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Calculate counts
  const pendingCount = Array.isArray(allRiders)
    ? allRiders.filter(rider => rider?.isApproved === false).length
    : 0;
  const ridersCount = Array.isArray(allRiders) ? allRiders.length : 0;
  const rejectedCount = getRejectedCount();

  const handleRiderClick = (rider: any) => {
    setSelectedRider(rider);
    setIsDialogOpen(true);
  };

  const handleVerifyRider = async () => {
    if (!selectedRider) return;

    setIsVerifying(true);
    try {
      const response = await axiosInstance.patch(`/api/v1/rider/verify/${selectedRider._id}`, {
        isApproved: true,
      });

      if (response.status === 200) {
        // Update the rider in the list
        const updatedRiders = allRiders.map(rider =>
          rider._id === selectedRider._id ? { ...rider, isApproved: true } : rider
        );
        setAllRiders(updatedRiders);
        // Update the selected rider
        setSelectedRider({ ...selectedRider, isApproved: true });
      }
    } catch (error) {
      console.log('Error verifying rider:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  console.log('reject reason::', rejectReason);

  const handleRejectRider = async () => {
    if (!selectedRider || !rejectReason.trim()) return;

    setIsRejecting(true);
    try {
      console.log('reject reason in the handleRejectRider::', rejectReason);

      const response = await axiosInstance.post(`/api/v1/rider/reject/${selectedRider._id}`, {
        isRejected: true,
        rejectionReason: rejectReason,
      });

      console.log('Rejection response:', response.data);

      if (response.status === 200) {
        // Add to rejected riders and remove from all riders
        const rejectedRider = {
          ...selectedRider,
          isRejected: true,
          rejectionReason: rejectReason,
        };

        // Use the new store method
        addRejectedRider(rejectedRider);

        // Close the dialog and reset
        setIsDialogOpen(false);
        setShowRejectForm(false);
        setRejectReason('');

        // Show success message
        toast({
          title: 'Rider Rejected',
          description: 'Rider has been rejected successfully.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.log('Error rejecting rider:', error);
      console.log('Error details:', (error as any).response?.data);

      // Show error message
      toast({
        title: 'Error',
        description: 'Failed to reject rider. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  // Function to handle opening reject form
  const openRejectForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRejectForm(true);
  };

  // Function to cancel rejection
  const cancelReject = () => {
    setShowRejectForm(false);
    setRejectReason('');
  };

  // Analytics data
  const riderStatusData = useMemo(() => [
    { name: 'Verified', value: allRiders.filter(rider => rider.isApproved === true).length, fill: '#10b981' },
    { name: 'Pending', value: allRiders.filter(rider => rider.isApproved === false).length, fill: '#f59e0b' },
    { name: 'Rejected', value: rejectedCount, fill: '#ef4444' },
  ], [allRiders, rejectedCount]);

  const riderAvailabilityData = useMemo(() => [
    { name: 'On Duty', value: allRiders.filter(rider => rider.isAvailable === true).length, fill: '#10b981' },
    { name: 'Off Duty', value: allRiders.filter(rider => rider.isAvailable === false).length, fill: '#6b7280' },
  ], [allRiders]);

  const vehicleTypeDistribution = useMemo(() => {
    const vehicleTypes = {};
    allRiders.forEach(rider => {
      if (rider.vehicleType) {
        vehicleTypes[rider.vehicleType] = (vehicleTypes[rider.vehicleType] || 0) + 1;
      }
    });
    
    return Object.entries(vehicleTypes)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  }, [allRiders]);

  const riderRegistrationTrend = useMemo(() => {
    const monthCounts = {};
    allRiders.forEach(rider => {
      const date = new Date(rider.createdAt);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });
    
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, riders: count }))
      .slice(-6);
  }, [allRiders]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ridersCount}</div>
            <p className="text-xs text-muted-foreground">All riders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground">Rejected riders</p>
          </CardContent>
        </Card>
      </div>

      {/* Rider Analytics Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Rider Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riderStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {riderStatusData.map((entry, index) => (
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

        {/* Rider Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Availability Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riderAvailabilityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {riderAvailabilityData.map((entry, index) => (
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

        {/* Vehicle Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Vehicle Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleTypeDistribution}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="type" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <Tooltip formatter={(value) => [value, 'Riders']} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Rider Registration Trend */}
        {riderRegistrationTrend.length > 0 && (
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Rider Registration Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riderRegistrationTrend}>
                    <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip formatter={(value) => [value, 'Riders']} />
                    <Legend />
                    <Line type="monotone" dataKey="riders" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search riders..."
              className="pl-8"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'active' && (
            <Select defaultValue="all" onValueChange={value => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">On Duty</SelectItem>
                <SelectItem value="inactive">Off Duty</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Riders</TabsTrigger>
          <TabsTrigger value="rejected">Rejected Riders</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {/* Active Riders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Verified ID</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Verification Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRiders.length > 0 ? (
                  filteredRiders.map(rider => (
                    <TableRow
                      key={rider._id || rider.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRiderClick(rider)}
                    >
                      <TableCell>{rider.fullName}</TableCell>
                      <TableCell>{rider.email}</TableCell>
                      <TableCell>{new Date(rider.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {rider?.panNumber?.length > 0 && <Badge variant="outline">PAN</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>{rider.vehicleType}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rider.isAvailable === true
                              ? 'default'
                              : rider.isAvailable === false
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {rider.isAvailable ? 'ON DUTY' : 'OFF DUTY'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={rider.isApproved === true ? 'default' : 'outline'}>
                          {rider.isApproved ? 'VERIFIED' : 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(rider._id || rider.id)}
                            >
                              Copy rider ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRiderClick(rider)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete rider
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No riders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          {/* Rejected Riders Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Rejection Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRejectedRiders.length > 0 ? (
                  filteredRejectedRiders.map(rider => (
                    <TableRow
                      key={rider._id || rider.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleRiderClick(rider)}
                    >
                      <TableCell>{rider.fullName}</TableCell>
                      <TableCell>{rider.email}</TableCell>
                      <TableCell>{new Date(rider.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{rider.vehicleType}</TableCell>
                      <TableCell>
                        <span className="line-clamp-2 text-sm text-muted-foreground">
                          {rider.rejectionReason || 'No reason provided'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(rider._id || rider.id)}
                            >
                              Copy rider ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRiderClick(rider)}>
                              View details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No rejected riders found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Rider Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          {selectedRider && (
            <>
              <DialogHeader>
                <DialogTitle>Rider Details</DialogTitle>
                <DialogDescription>View and verify rider information</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Full Name:</span>
                    <span>{selectedRider.fullName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{selectedRider.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>+91{selectedRider.phoneNumber}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Gender:</span>
                    <span>{selectedRider.gender}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Vehicle Type:</span>
                    <span>{selectedRider.vehicleType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">PAN Number:</span>
                    <span>{selectedRider.panNumber || 'Not provided'}</span>
                  </div>
                </div>

                {/* Documents section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Documents</h3>

                  {selectedRider.identityImage && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">PAN Card</span>
                      </div>
                      <div className="aspect-video max-h-[200px] relative rounded-md border overflow-hidden">
                        <img
                          src={selectedRider.identityImage}
                          alt="PAN Card"
                          className="h-full w-full object-contain"
                          onError={e => {
                            (e.target as any).onerror = null;
                            (e.target as any).src = 'https://placehold.co/600x400?text=Image+Not+Available';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Verification status */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">Verification Status:</span>
                  <Badge variant={selectedRider.isApproved ? 'default' : 'outline'}>
                    {selectedRider.isApproved ? 'VERIFIED' : 'PENDING'}
                  </Badge>
                </div>

                {/* Rejection reason (if rejected) */}
                {selectedRider.isRejected && (
                  <div className="space-y-2">
                    <span className="font-medium">Rejection Reason:</span>
                    <p className="text-sm p-3 bg-muted rounded-md">
                      {selectedRider.rejectionReason || 'No reason provided'}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>

                {!selectedRider.isApproved && !selectedRider.isRejected && !showRejectForm && (
                  <>
                    <Button variant="destructive" disabled={isVerifying} onClick={openRejectForm}>
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button disabled={isVerifying} onClick={handleVerifyRider}>
                      {isVerifying ? (
                        'Verifying...'
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Verify Rider
                        </>
                      )}
                    </Button>
                  </>
                )}

                {showRejectForm && (
                  <div className="w-full space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="reject-reason">Reason for rejection</Label>
                      <Textarea
                        id="reject-reason"
                        placeholder="Enter the reason for rejecting this rider application..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={cancelReject} disabled={isRejecting}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleRejectRider}
                        disabled={isRejecting || !rejectReason.trim()}
                      >
                        {isRejecting ? 'Rejecting...' : 'Submit Rejection'}
                      </Button>
                    </div>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
