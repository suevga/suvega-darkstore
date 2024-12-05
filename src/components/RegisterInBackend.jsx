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
  const [verificationStatus, setVerificationStatus] = useState('checking');
  const { user, isLoaded } = useUser();
  const { latitude, longitude, error: locationError, requestLocation } = useLocationHook();
  const { setDarkstoreRegistered, setIsNewUser, setDarkstoreId, darkstoreRegistered } = useUserStore();
  const [registrationError, setRegistrationError] = useState(null);

  useEffect(() => {
    let isSubscribed = true;

    const verifyRegistration = async () => {
      if (!user?.id) return;

      try {
        const response = await axiosInstance.post('/api/v1/store/check', {
          storename: user.username,
          email: user.primaryEmailAddress.emailAddress
        });
        
        console.log("Response from backend:", JSON.stringify(response.data));
        
        if (response.data.data.isRegistered) {
          setDarkstoreId(response.data.data.storeDetails._id);
          setDarkstoreRegistered(true);
          setIsNewUser(false);
          setVerificationStatus('registered');
        } else {
          setVerificationStatus('pending');
          setDarkstoreRegistered(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setRegistrationError(error.message);
        setDarkstoreRegistered(false);
      }
    };

    if (isLoaded && user) {
      verifyRegistration();
    }

    return () => {
      isSubscribed = false;
    };
  }, [isLoaded, user, setDarkstoreRegistered, setIsNewUser, setDarkstoreId]);

  const handleRegistration = async () => {
    if (!latitude || !longitude) {
      requestLocation();
      return;
    }

    setVerificationStatus('registering');
    try {
      const response = await axiosInstance.post('/api/v1/store/register', {
        storename: user.username,
        email: user.primaryEmailAddress?.emailAddress,
        location: { latitude, longitude }
      });

      setDarkstoreId(response.data.data._id);
      setDarkstoreRegistered(true);
      setIsNewUser(false);
      setVerificationStatus('registered');
    } catch (error) {
      console.error('Registration error:', error);
      setVerificationStatus('error');
      setRegistrationError(error.message);
    }
  };

  if (verificationStatus === 'registered' || darkstoreRegistered) {
    return children;
  }

  if (verificationStatus === 'checking' || !isLoaded) {
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
          {verificationStatus === 'error' && (
            <Alert variant="destructive">
              <AlertTitle>Registration Error</AlertTitle>
              <AlertDescription>{registrationError}</AlertDescription>
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
              disabled={verificationStatus === 'registering'}
            >
              {verificationStatus === 'registering' ? (
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

