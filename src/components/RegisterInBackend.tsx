import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useGoogleLocation } from '../hooks/useLocation';
import { useDarkStore } from '../store/darkStore';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, MapPin } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export const RegistrationVerification = ({ children }: {children: React.ReactNode}) => {
  const { user, isLoaded } = useUser();
  const {
    latitude,
    longitude,
    error: locationError,
    requestLocation,
  } = useGoogleLocation();

  const {
    darkstoreRegistered,
    registrationPending,
    setDarkstoreRegistered,
    setIsNewUser,
    setRegistrationPending,
    setDarkstoreId,
    setDarkstoreDetails,
  } = useDarkStore();

  const [verificationError, setVerificationError] = useState<string | null>(null);

  useEffect(() => {
    const verifyRegistration = async () => {
      if (!user) return;
      if (!user.primaryEmailAddress) {
        setVerificationError('User email not found');
        return;
      }
      setRegistrationPending(true);
      try {
        const response = await axiosInstance.post('/api/v1/store/check', {
          storename: user.username,
          email: user.primaryEmailAddress.emailAddress,
        });
        console.log('response from backend in register page::', JSON.stringify(response.data));

        if (response.data.data.isRegistered) {
          setDarkstoreId(response.data.data.storeDetails._id);
          setDarkstoreRegistered(true);
          setDarkstoreDetails(response.data.data.storeDetails);
          setIsNewUser(false);
        } else {
          setDarkstoreRegistered(false);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setRegistrationPending(false);
      }
    };

    if (isLoaded && user) {
      verifyRegistration();
    }
  }, [
    isLoaded,
    user,
    setDarkstoreRegistered,
    setIsNewUser,
    setDarkstoreId,
    setRegistrationPending,
  ]);

  const handleRegistration = async () => {
    if (!latitude || !longitude) {
      requestLocation();
      return;
    }
    if (!user) return;
    if (!user.primaryEmailAddress) {
      setVerificationError('User email not found');
      return;
    }
    setRegistrationPending(true);
    try {
      const response = await axiosInstance.post('/api/v1/store/register', {
        storename: user.username,
        email: user.primaryEmailAddress?.emailAddress,
        location: { latitude, longitude },
      });

      console.log('response after sucessfull register::', JSON.stringify(response.data));

      if (response.data?.data) {
        setDarkstoreId(response.data.data._id);
        setDarkstoreRegistered(true);
        setIsNewUser(false);
      } else {
        setVerificationError('registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setVerificationError(error instanceof Error ? error.message : 'Unknown error');
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

            <Button className="w-full" onClick={handleRegistration} disabled={registrationPending}>
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
