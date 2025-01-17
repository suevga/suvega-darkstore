import React, { useEffect, useState } from 'react'
import { useDarkStore } from '../store/darkStore.js';
import axiosInstance from '../api/axiosInstance.js';
import { useForm } from "react-hook-form"
import { useToast } from "../hooks/use-toast.ts"
import { X, Loader2 } from 'lucide-react'
import { Button } from "../components/ui/button.tsx";
import { Input } from "../components/ui/input.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.tsx";

export default function ProfilePage() {
  const { darkstoreId, setDarkstoreDetails, darkstoreDetails } = useDarkStore();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  console.log("dark store details::", darkstoreDetails);
  console.log("dark store id::", darkstoreId);
  
  const form = useForm({
      defaultValues: {
        address:{
          city: "",
          street: "",
          district: "",
          state: "",
          pincode: ""
        }
      },
  })

  const fetchDarkstoreDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/v1/store/getStore/${darkstoreId}`);

      if (response.status === 200) {
        setDarkstoreDetails(response.data.data);
        toast({
          title: "Darkstore details fetched successfully",
        })
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching darkstore details:', error);
      setLoading(false);
      toast({
        title: "Error fetching darkstore details",
        variant: "destructive"
      })
    }
  };

  const handleUpdateAddress = async (data) => {
    try {
      setLoading(true);
      console.log("data from useForm::", data);
      
      const response = await axiosInstance.patch(`/api/v1/store/updateAddress/${darkstoreId}`, data);

      if (response.status === 200) {
        console.log("updated darkstore details::", JSON.stringify(response.data.data.updatedStore));
        setDarkstoreDetails(response.data.data.updatedStore);
        toast({
          title: "Darkstore details updated successfully",
        })
        setIsEditing(false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error updating darkstore details:', error);
      setLoading(false);
      setIsEditing(false);
      toast({
        title: "Error updating darkstore details",
        variant: "destructive"
      })
    }
  };

  useEffect(() => {
    if (darkstoreDetails === null && darkstoreDetails === undefined) {
      fetchDarkstoreDetails();
    }
  }, [darkstoreId]);

  console.log("dark store details after fetch::", darkstoreDetails);
  return (
    <div>
      {
        loading ? (
          <Loader2 className="w-8 h-8 animate-spin" />
        ) : <div>
          {
            isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateAddress)} className="space-y-4 flex justify-between items-start">
                  <div className="w-2/3">
                    <FormField
                    control={form.control}
                    name="address.city"
                    rules={{ 
                      required: "city name is required",
                      minLength: {
                        value: 2,
                        message: "city name must be at least 2 characters"
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter City name" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="address.street"
                    rules={{
                      required: "street name is required",
                      minLength: {
                        value: 2,
                        message: "street name must be at least 5 characters"
                      }
                    }}
                    render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street name</FormLabel>
                      <FormControl>
                      <Input 
                        placeholder="Enter Street name" 
                        {...field} 
                        disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="address.district"
                    rules={{ required: "district is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter district name" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                      control={form.control}
                      name="address.state"
                      rules={{ 
                        required: "state name is required",
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter State name" 
                              {...field} 
                              disabled={loading}
                            />
                          </FormControl>
    
                        </FormItem>
                      )}
                      />

                      <FormField
                        control={form.control}
                        name="address.pincode"
                        rules={{ 
                          required: "pincode is required",
                          minLength: {
                            value: 6,
                            message: "pincode must be 6 characters"
                          }
                        }}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pincode</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter Pincode" 
                                {...field} 
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  <Button 
                  type="submit"
                  className="mt-4"
                  disabled={loading}
                  >
                    {loading ? "updating..." : "update address"}
                  </Button>
                  </div>  
                </form>
              </Form>
            ): (
              <div>
              <h2 className='font-bold text-2xl'>Darkstore Details</h2>
              {
                darkstoreDetails && (
                  <div>
                    <h2>Name: {darkstoreDetails.storename}</h2>
                    <h4>Email: {darkstoreDetails.email}</h4>
                    <h4>City: {darkstoreDetails.address.city}</h4>
                    <h4>Street: {darkstoreDetails.address.street}</h4>
                    <h4>District: {darkstoreDetails.address.district}</h4>
                    <h4>State: {darkstoreDetails.address.state}</h4>
                  </div>
                )
              }
              <Button 
              onClick={() => setIsEditing(true)}
              >
                Update Address
              </Button>
            </div>
            )
          }
        </div>
      }
    </div>
    
    
  )
}

