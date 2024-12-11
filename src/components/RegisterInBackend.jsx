import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useLocation as useLocationHook } from '../hooks/useLocation.js';
import { useUserStore } from '../store/userStore.js';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, MapPin } from 'lucide-react';
import axiosInstance from '../api/axiosInstance.js';

export const RegistrationVerification = ({ children }) => {
  const { user, isLoaded } = useUser();
  const { latitude, longitude, error: locationError, requestLocation } = useLocationHook();
  const {
    isNewUser,
    darkstoreRegistered,
    registrationPending,
    setDarkstoreRegistered,
    setIsNewUser,
    setRegistrationPending,
    setDarkstoreId,
  } = useUserStore();

  const [verificationError, setVerificationError] = useState(null);

  useEffect(() => {

    const verifyRegistration = async () => {
      if (!user?.id) return;
      console.log("darkstore register hoi ne nohoi checking start hoise");
      
      setRegistrationPending(true);
      
      console.log("darkstored status before check::", darkstoreRegistered);
      try {
        console.log("checking request goise backend");
        
        const response = await axiosInstance.post('/api/v1/store/check', {
          storename: user.username,
          email: user.primaryEmailAddress.emailAddress
        });
        
        
        console.log("response received");
        console.log("deployed backend or pora response ahile:: " + JSON.stringify(response.data));
        
        if (response.data.data.isRegistered) {
          setDarkstoreId(response.data.data.storeDetails._id);
          setDarkstoreRegistered(true);
          setIsNewUser(false);
          console.log("darkstored status after response::", darkstoreRegistered);
        } else {
          setDarkstoreRegistered(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationError(error.message);
      } finally {
        setRegistrationPending(false);
      }
    };

    if (isLoaded && user) {
      verifyRegistration();
    }

    console.log("darkstore status after checking complete::", darkstoreRegistered);
    
  }, [isLoaded, user, setDarkstoreRegistered, setIsNewUser, setDarkstoreId, setRegistrationPending]);

  const handleRegistration = async () => {
    if (!latitude || !longitude) {
      requestLocation();
      return;
    }
    
    setRegistrationPending(true);
    try {
      console.log("darkstore registration status false huwar karone register start hoise");
      const response = await axiosInstance.post('/api/v1/store/register', {
        storename: user.username,
        email: user.primaryEmailAddress?.emailAddress,
        location: { latitude, longitude }
      });

      if (response.data?.data) {
        console.log("deployed backend or pora response ahile after register new store:: " + JSON.stringify(response.data));
        
        setDarkstoreId(response.data.data._id);
        setDarkstoreRegistered(true);
        setIsNewUser(false);  
        console.log("Darkstore registered status::", darkstoreRegistered);
        
      } else {
        setVerificationError("registration failed")
      }
    } catch (error) {
      console.error('Registration error:', error);
      setVerificationError(error.message);
    } finally {
      setRegistrationPending(false);
    }
  };

  if (darkstoreRegistered) {
    return children;
  }

  if (registrationPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-lg">Verifying registration status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Registration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
        {verificationError && (
            <Alert variant="destructive">
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
        )}
        {locationError && (
            <Alert variant="destructive">
              <AlertTitle>Location Error</AlertTitle>
              <AlertDescription>{locationError}</AlertDescription>
            </Alert>
        )}
          
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <p>Location access is required to register your darkstore</p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleRegistration}
            disabled={registrationPending}
          >
            {registrationPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
              ) : (
                'Complete Registration'
            )}
          </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

