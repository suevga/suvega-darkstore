import { useState, useEffect } from 'react'
import { useLocationStore } from '../store/store.js'

export const useLocation = () => {
  const [error, setError] = useState(null)
  const { latitude, longitude, setLocation } = useLocationStore()

  const requestLocation = async () => {
    if ('permissions' in navigator && 'geolocation' in navigator) {
      try {
        // First, query the permission state
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
        
        if (permissionStatus.state === 'denied') {
          // If permission is denied, we need to guide the user to reset permissions
          setError('Location access is blocked. Please reset location permissions in your browser settings and try again.')
          return
        }

        // Request the location
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(position.coords.latitude, position.coords.longitude)
            setError(null)
          },
          (err) => {
            // Handle specific geolocation errors
            let errorMessage = 'Unable to retrieve your location. '
            
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage += 'Please allow location access in your browser settings.'
                break
              case err.POSITION_UNAVAILABLE:
                errorMessage += 'Location information is unavailable.'
                break
              case err.TIMEOUT:
                errorMessage += 'The request to get location timed out.'
                break
              default:
                errorMessage += 'An unknown error occurred.'
            }
            
            setError(errorMessage)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0 // Force fresh location request
          }
        )
      } catch (error) {
        setError('An error occurred while requesting location access.')
      }
    } else {
      setError('Geolocation is not supported by your browser.')
    }
  }

  useEffect(() => {
    if (!latitude || !longitude) {
      requestLocation()
    }
  }, [latitude, longitude])

  return { 
    latitude, 
    longitude, 
    error, 
    requestLocation,
    openLocationSettings: () => {
      if (error?.includes('blocked')) {
        setError(
          'Location access is blocked. Please follow these steps to enable location access:\n' +
          '1. Click the lock/info icon in your browser\'s address bar\n' +
          '2. Click on "Site settings" or "Permissions"\n' +
          '3. Allow location access\n' +
          '4. Refresh the page'
        )
      }
    }
  }
}

