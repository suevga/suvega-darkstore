import { useEffect, useState } from 'react';
import { useDarkStore } from '../store/darkStore';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { useToast } from '../hooks/use-toast';
import { 
  Loader2, 
  MapPin, 
  Mail, 
  Store, 
  Edit3, 
  Save, 
  X, 
  Building2,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';

export default function ProfilePage() {
  const { darkstoreId, setDarkstoreDetails, darkstoreDetails } = useDarkStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  console.log('dark store details::', darkstoreDetails);
  console.log('dark store id::', darkstoreId);

  const form = useForm({
    defaultValues: {
      address: {
        city: '',
        street: '',
        district: '',
        state: '',
        pincode: '',
      },
    },
  });

  const fetchDarkstoreDetails = async () => {
    if (!darkstoreId) {
      toast({
        title: 'Error',
        description: 'No darkstore ID found',
        variant: 'destructive',
      });
      return;
    }
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/v1/store/getStore/${darkstoreId}`);
      console.log('darkstore details paisu backend or pora::', JSON.stringify(response));

      if (response.status === 200) {
        setDarkstoreDetails(response.data.data);
        toast({
          title: 'Darkstore details fetched successfully',
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching darkstore details:', error);
      setLoading(false);
      toast({
        title: 'Error fetching darkstore details',
        description: 'Error fetching darkstore details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (data: any) => {
    if (!darkstoreId) {
      toast({
        title: 'Error',
        description: 'No darkstore ID found',
        variant: 'destructive',
      });
      return;
    }
    try {
      setLoading(true);
      console.log('data from useForm::', data);

      const response = await axiosInstance.patch(`/api/v1/store/updateAddress/${darkstoreId}`, {
        address: data.address,
      });

      if (response.status === 200) {
        console.log('updated darkstore details::', JSON.stringify(response.data.data.updatedStore));
        setDarkstoreDetails(response.data.data.updatedStore);
        toast({
          title: 'Darkstore details updated successfully',
        });
        setIsEditing(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error updating darkstore details:', error);
      setLoading(false);
      setIsEditing(false);
      toast({
        title: 'Error updating darkstore details',
        description: 'Error updating address',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!darkstoreDetails || Object.keys(darkstoreDetails).length === 0) {
      fetchDarkstoreDetails();
    }
  }, [darkstoreId]);

  // Pre-populate form when editing
  useEffect(() => {
    if (isEditing && darkstoreDetails?.address) {
      form.reset({
        address: {
          city: darkstoreDetails.address.city || '',
          street: darkstoreDetails.address.street || '',
          district: darkstoreDetails.address.district || '',
          state: darkstoreDetails.address.state || '',
          pincode: darkstoreDetails.address.pinCode || '',
        },
      });
    }
  }, [isEditing, darkstoreDetails]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  console.log('dark store details after fetch::', darkstoreDetails);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Store Profile</h1>
            <p className="text-muted-foreground mt-1">
              Manage your darkstore information and settings
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="self-start sm:self-center">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        /* Edit Mode */
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Edit Store Information
                </CardTitle>
                <CardDescription>
                  Update your store details and address information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateAddress)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* City Field */}
                  <FormField
                    control={form.control}
                    name="address.city"
                    rules={{
                      required: 'City name is required',
                      minLength: {
                        value: 2,
                        message: 'City name must be at least 2 characters',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          City
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter city name" 
                            {...field} 
                            disabled={loading}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* District Field */}
                  <FormField
                    control={form.control}
                    name="address.district"
                    rules={{ required: 'District is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          District
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter district name" 
                            {...field} 
                            disabled={loading}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Street Field - Full Width */}
                <FormField
                  control={form.control}
                  name="address.street"
                  rules={{
                    required: 'Street name is required',
                    minLength: {
                      value: 2,
                      message: 'Street name must be at least 2 characters',
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Street Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter street address" 
                          {...field} 
                          disabled={loading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* State Field */}
                  <FormField
                    control={form.control}
                    name="address.state"
                    rules={{
                      required: 'State name is required',
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter state name" 
                            {...field} 
                            disabled={loading}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Pincode Field */}
                  <FormField
                    control={form.control}
                    name="address.pincode"
                    rules={{
                      required: 'Pincode is required',
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: 'Pincode must be 6 digits',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter pincode" 
                            {...field} 
                            disabled={loading}
                            className="h-11"
                            maxLength={6}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Update Address
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        /* View Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="" alt={darkstoreDetails?.storename} />
                    <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                      {darkstoreDetails?.storename ? getInitials(darkstoreDetails.storename) : 'DS'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      {darkstoreDetails?.storename || 'Store Name'}
                    </h2>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                      <CheckCircle className="w-3 h-3" />
                      Active Store
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{darkstoreDetails?.email || 'No email'}</span>
                  </div>

                  {darkstoreDetails?.createdAt && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Member since {formatDate(darkstoreDetails.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Store Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Information
                </CardTitle>
                <CardDescription>
                  Basic details about your darkstore
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Store Name</p>
                    <p className="text-base font-medium">
                      {darkstoreDetails?.storename || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                    <p className="text-base font-medium">
                      {darkstoreDetails?.email || 'Not provided'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Store ID</p>
                    <p className="text-base font-mono text-xs bg-muted px-2 py-1 rounded">
                      {darkstoreId || 'Not available'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline" className="w-fit">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Address Information
                  </CardTitle>
                  <CardDescription>
                    Store location and address details
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                {darkstoreDetails?.address ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">City</p>
                        <p className="text-base font-medium">
                          {darkstoreDetails.address.city || 'Not provided'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">District</p>
                        <p className="text-base font-medium">
                          {darkstoreDetails.address.district || 'Not provided'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Street Address</p>
                      <p className="text-base font-medium">
                        {darkstoreDetails.address.street || 'Not provided'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">State</p>
                        <p className="text-base font-medium">
                          {darkstoreDetails.address.state || 'Not provided'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Pincode</p>
                        <p className="text-base font-mono bg-muted px-2 py-1 rounded w-fit">
                          {darkstoreDetails.address.pinCode || 'Not provided'}
                        </p>
                      </div>
                    </div>

                    {/* Full Address Display */}
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Complete Address</p>
                      <div className="p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
                        <p className="text-sm leading-relaxed">
                          {[
                            darkstoreDetails.address.street,
                            darkstoreDetails.address.city,
                            darkstoreDetails.address.district,
                            darkstoreDetails.address.state,
                            darkstoreDetails.address.pinCode
                          ].filter(Boolean).join(', ') || 'Address information incomplete'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Address Information</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your store address to complete your profile
                    </p>
                    <Button onClick={() => setIsEditing(true)}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Add Address
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
