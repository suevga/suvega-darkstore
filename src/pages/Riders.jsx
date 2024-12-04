import { useState } from 'react'
import { PlusCircle, Search, Users, ClipboardList, CheckCircle2, XCircle, MoreHorizontal } from 'lucide-react'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

export default function RidersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRiders = riders.filter(rider => 
    (rider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     rider.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "all" || rider.status === statusFilter)
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Riders</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Rider
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">
              +12 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              -3 from last week
            </p>
          </CardContent>
        </Card>
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
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select 
            defaultValue="all"
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Riders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rider ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Verified ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRiders.map((rider) => (
              <TableRow key={rider.id}>
                <TableCell className="font-medium">#{rider.id}</TableCell>
                <TableCell>{rider.name}</TableCell>
                <TableCell>{rider.email}</TableCell>
                <TableCell>{rider.joinedDate}</TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    {rider.verifiedId.panCard && <Badge variant="outline">PAN</Badge>}
                    {rider.verifiedId.adharCard && <Badge variant="outline">Aadhar</Badge>}
                    {rider.verifiedId.drivingLicense && <Badge variant="outline">DL</Badge>}
                  </div>
                </TableCell>
                <TableCell>{rider.vehicle}</TableCell>
                <TableCell>
                  <Badge
                    variant={rider.status === "active" ? "default" : 
                             rider.status === "inactive" ? "secondary" : "outline"}
                  >
                    {rider.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(rider.id)}>
                        Copy rider ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>View details</DropdownMenuItem>
                      <DropdownMenuItem>Edit rider</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete rider</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Verification Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Verify New Riders</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Verify Rider Documents</DialogTitle>
            <DialogDescription>
              Review and approve rider documents here. Make sure all information is correct before verifying.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <span className="col-span-4">Rider: John Doe</span>
              <span className="col-span-4">Document: PAN Card</span>
              <img src="/placeholder.svg" alt="Document preview" className="col-span-4 h-32 w-full object-cover" />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline"><XCircle className="mr-2 h-4 w-4" /> Reject</Button>
            <Button><CheckCircle2 className="mr-2 h-4 w-4" /> Verify</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Sample data
const riders = [
  {
    id: "RID001",
    name: "John Doe",
    email: "john.doe@example.com",
    joinedDate: "2024-01-15",
    verifiedId: { panCard: true, adharCard: true, drivingLicense: true },
    vehicle: "Motorcycle",
    status: "active",
  },
  {
    id: "RID002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    joinedDate: "2024-01-16",
    verifiedId: { panCard: true, adharCard: true, drivingLicense: false },
    vehicle: "Scooter",
    status: "pending",
  },
  {
    id: "RID003",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    joinedDate: "2024-01-17",
    verifiedId: { panCard: true, adharCard: false, drivingLicense: true },
    vehicle: "Bicycle",
    status: "active",
  },
  {
    id: "RID004",
    name: "Alice Brown",
    email: "alice.brown@example.com",
    joinedDate: "2024-01-18",
    verifiedId: { panCard: true, adharCard: true, drivingLicense: true },
    vehicle: "Electric Bike",
    status: "inactive",
  },
  {
    id: "RID005",
    name: "Charlie Wilson",
    email: "charlie.wilson@example.com",
    joinedDate: "2024-01-19",
    verifiedId: { panCard: false, adharCard: true, drivingLicense: true },
    vehicle: "Motorcycle",
    status: "active",
  },
]

