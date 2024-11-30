import React, { useEffect, useRef } from 'react'
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom'
import { BarChart, Package, ShoppingCart, User, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { useClerk, useUser } from '@clerk/clerk-react'
import { useLocation as useLocationHook } from '../hooks/useLocation.js'
import { useUserStore } from '../store/userStore.js'
import { LocationError } from './LocationError'
import { toast } from '../hooks/use-toast.ts'
import axiosInstance from '../api/axiosInstance.js'

export function Layout() {
  const locationPath = useLocation()
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { user, isLoaded } = useUser()
  const { latitude, longitude, error, requestLocation, openLocationSettings } = useLocationHook()
  const { isNewUser, setIsNewUser, setDarkstoreRegistered,  darkstoreRegistered,  registrationPending, setRegistrationPending } = useUserStore();
  const registrationAttempted = useRef(false)

  const menuItems = [
    { icon: BarChart, label: 'Dashboard', href: '/dashboard' },
    { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
    { icon: Package, label: 'Inventory', href: '/dashboard/inventory' },
    { icon: User, label: 'Profile', href: '/dashboard/profile' },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  useEffect(() => {
    if (isLoaded && user) {
      if (!darkstoreRegistered && !registrationPending) {
        setRegistrationPending(true);
      }
      
    }
  }, [isLoaded, user, darkstoreRegistered, registrationPending, setRegistrationPending])

  useEffect(() => {
    const registerDarkstore = async () => {
      if (registrationPending && latitude && longitude && user && !registrationAttempted.current) {
        registrationAttempted.current = true
        console.log('Attempting to register darkstore')
        try {
          await axiosInstance.post('/api/v1/store/register', {
            storename: user.username,
            email: user.primaryEmailAddress?.emailAddress,
            location: { latitude, longitude }
          })
          
          setDarkstoreRegistered(true)
          setIsNewUser(false)
          setRegistrationPending(false)
          toast({
            title: "Registration Successful",
            description: "Your darkstore has been registered successfully.",
          })
          console.log('Darkstore registered successfully')
        } catch (error) {
          console.error('Error sending data to backend:', error)
          toast({
            title: "Registration Failed",
            description: "There was an error registering your darkstore. Please try again.",
            variant: "destructive",
          })
          setRegistrationPending(false)
          registrationAttempted.current = false
        }
      }
    }

    registerDarkstore()
  }, [registrationPending, latitude, longitude, user, setIsNewUser, setDarkstoreRegistered, setRegistrationPending])

  useEffect(() => {
    if (registrationPending && (!latitude || !longitude)) {
      console.log('Requesting location')
      requestLocation()
    }
  }, [registrationPending, latitude, longitude, requestLocation])

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LocationError 
          message={error} 
          onRetry={requestLocation}
          onOpenSettings={openLocationSettings}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Dark Store Admin</h1>
        </div>
        <nav className="mt-6 flex flex-col h-[calc(100%-5rem)] justify-between">
          <div>
            {menuItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 ${
                    locationPath.pathname === item.href ? 'bg-gray-100 text-gray-900' : ''
                  }`}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign out
            </Button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

