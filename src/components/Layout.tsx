import { useState, useEffect } from 'react';
import { useLocation, Link, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart,
  ShoppingCart,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  User2Icon,
  Package2,
  Box,
  Bike,
  Image,
  BoxesIcon,
  Menu,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { useClerk } from '@clerk/clerk-react';
import { useGoogleLocation } from '../hooks/useLocation';
import { LocationError } from './LocationError';
import { cn } from '../lib/utils';
import { useUserStore } from '../store/allUsersStore';
import { useDarkStore } from '../store/darkStore';
import { useCategoryStore } from '../store/categoryStore';
import { useProductStore } from '../store/productStore';
import GlobalNotificationService from './GlobalNotificationService';

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const locationPath = useLocation();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { error, requestLocation } = useGoogleLocation();
  const { clearUsers } = useUserStore();
  const { resetDarkstore } = useDarkStore();
  const { clearCategories } = useCategoryStore();
  const { clearProducts } = useProductStore();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [locationPath.pathname]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const menuItems = [
    { icon: BarChart, label: 'Dashboard', href: '/dashboard' },
    { icon: User, label: 'All Users', href: '/dashboard/allusers' },
    { icon: ShoppingCart, label: 'Orders', href: '/dashboard/orders' },
    { icon: Package2, label: 'Products', href: '/dashboard/products' },
    { icon: Box, label: 'Categories', href: '/dashboard/categories' },
    { icon: Bike, label: 'Riders', href: '/dashboard/riders' },
    { icon: BoxesIcon, label: 'Inventory', href: '/dashboard/inventory' },
    { icon: Image, label: 'Banner', href: '/dashboard/banners' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      clearUsers();
      resetDarkstore();
      clearCategories();
      clearProducts();

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LocationError 
          message={typeof error === 'string' ? error : 'Location access error'} 
          onRetry={requestLocation} 
          onOpenSettings={() => {
            // Open browser settings - this is browser-specific
            console.log('Opening location settings...');
          }}
        />
      </div>
    );
  }

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Dark Store Admin</h1>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <nav className="mt-6 flex flex-col h-[calc(100%-5rem)] justify-between">
        <div>
          {menuItems.map(item => (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  (locationPath.pathname === item.href || 
                   (item.href !== '/dashboard' && locationPath.pathname.startsWith(item.href))) && 
                   'bg-gray-100 text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5 mr-2" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        <div className="p-4">
          <Link to="/dashboard/profile">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                locationPath.pathname === '/dashboard/profile' && 'bg-gray-100 text-gray-900'
              )}
            >
              <User2Icon className="h-5 w-5 mr-2" />
              Profile
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sign out
          </Button>
        </div>
      </nav>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Global Notification Service */}
      <GlobalNotificationService />

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex bg-white shadow-lg transition-all duration-300 ease-in-out relative flex-col',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="p-4 flex items-center justify-between">
          {!collapsed && <h1 className="text-xl font-bold text-gray-800">Dark Store Admin</h1>}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -right-4 top-6 rounded-full bg-white shadow-md z-10"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="mt-6 flex flex-col h-[calc(100%-5rem)] justify-between overflow-y-auto">
          <div>
            {menuItems.map(item => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    (locationPath.pathname === item.href || 
                     (item.href !== '/dashboard' && locationPath.pathname.startsWith(item.href))) && 
                     'bg-gray-100 text-gray-900',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', !collapsed && 'mr-2')} />
                  {!collapsed && item.label}
                </Button>
              </Link>
            ))}
          </div>
          <div className="p-4">
            <Link to="/dashboard/profile">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  locationPath.pathname === '/dashboard/profile' && 'bg-gray-100 text-gray-900',
                  collapsed && 'justify-center px-2'
                )}
              >
                <User2Icon className={cn('h-5 w-5', !collapsed && 'mr-2')} />
                {!collapsed && 'Profile'}
              </Button>
            </Link>
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start px-4 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              onClick={handleSignOut}
            >
              <LogOut className={cn('h-5 w-5', !collapsed && 'mr-2')} />
              {!collapsed && 'Sign out'}
            </Button>
          </div>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
          <div /> {/* Spacer */}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
