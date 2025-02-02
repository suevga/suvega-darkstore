// useGoogleLocation.js
import { useState } from 'react';
import { useLocationStore } from '../store/locationStore';
import { envConfig } from '../utility/env.config';


export const useGoogleLocation = () => {
  const { latitude, longitude, error, setLocation, setError } = useLocationStore();
  const [loading, setLoading] = useState(false);
 
  const requestLocation = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${envConfig.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();

      if (data.location) {
        setLocation(data.location.lat, data.location.lng);
        setError(null);
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      setError(error.message);
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