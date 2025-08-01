// useGoogleLocation.js
import { useState } from 'react';
import { useLocationStore } from '../store/locationStore';
import { envConfig } from '../utility/env.config';
import { GoogleLocationResponse } from '@/types/location';

// Export with both names for backward compatibility
export const useGoogleLocation = () => {
  const { latitude, longitude, error, setLocation, setError } = useLocationStore();
  const [loading, setLoading] = useState(false);

  const requestLocation = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${envConfig.googleApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('response from google location::', response);

      const data: GoogleLocationResponse = await response.json();
      console.log('data from google location::', data.location);

      if (data.location) {
        setLocation(data.location.lat, data.location.lng);
        setError(null);
      } else {
        throw new Error('Location not found');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return {
    latitude,
    longitude,
    error,
    requestLocation,
    loading 
  };
};

// Export the same hook as useLocation for compatibility with existing imports
export const useLocation = useGoogleLocation;
