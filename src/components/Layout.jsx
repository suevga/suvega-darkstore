import React, { useState } from 'react'
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom'
import { BarChart, ShoppingCart, User, LogOut, ChevronRight, ChevronLeft, User2Icon, Package2, Box, Bike, Image, BoxesIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useClerk } from '@clerk/clerk-react'
import { useGoogleLocation } from '../hooks/useLocation.js'
import { LocationError } from './LocationError.jsx'
import { cn } from '../lib/utils.ts';
import { useUserStore } from '../store/allUsersStore.js'
import { useDarkStore } from '../store/darkStore.js'
import { useCategoryStore } from '../store/categoryStore.js'
import { useProductStore } from '../store/productStore.js'
import GlobalNotificationService from './GlobalNotificationService.jsx'

export const Layout = ()=> {
  const [collapsed, setCollapsed] = useState(false);
  const locationPath = useLocation()
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { error, requestLocation } = useGoogleLocation()
  const { clearUsers } = useUserStore();
  const { resetDarkstore } = useDarkStore();
  const { clearCategories } = useCategoryStore();
  const { clearProducts } = useProductStore();
  const menuItems = [
    { icon: BarChart, label: 'Dashboard', href: '/dashboard' },
    {icon: User, label: 'All Users', href: '/dashboard/users'},
    { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders'},
    {icon: Package2, label: 'Products', href: '/dashboard/products'},
    {icon: Box, label: 'Categories', href: '/dashboard/categories'},
    {icon: Bike, label: 'Riders', href: '/dashboard/riders'},
    {icon: BoxesIcon, label: "Inventory", href: "/dashboard/inventory"},
    { icon: Image, label: 'Banner', href: '/dashboard/banners' },
  ]

  const handleSignOut = async () => {
    try {
      await signOut();
      clearUsers();
      resetDarkstore();
      clearCategories();
      clearProducts();
      
      navigate('/login', { replace: true })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LocationError 
          message={error} 
          onRetry={requestLocation}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Global Notification Service - placed at the app root */}
      <GlobalNotificationService />
      
      <aside  className={cn(
          "bg-white shadow-md transition-all duration-300 ease-in-out relative",
          collapsed ? "w-16" : "w-64"
        )}>
                <div className="p-4 flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold text-gray-800">Dark Store Admin</h1>}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-4 top-6 rounded-full bg-white shadow-md"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        <nav className="mt-6 flex flex-col h-[calc(100%-5rem)] justify-between">
          <div>
            {menuItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    locationPath.pathname === item.href && "bg-gray-100 text-gray-900",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                  {!collapsed && item.label}
                </Button>
              </Link>
            ))}
          </div>
          <div className="p-4">
            <Link to='/dashboard/profile'>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                locationPath.pathname === '/dashboard/profile' && "bg-gray-100 text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              <User2Icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
              {!collapsed && "Profile"}
            </Button>
            </Link>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              onClick={handleSignOut}
            >
              <LogOut className={cn("h-5 w-5", !collapsed && "mr-2")} />
              {!collapsed && "Sign out"}
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

