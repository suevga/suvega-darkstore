import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import RegistrationForm from './components/DarkstoreAdmin/DarkstoreAdminRegister';
import { LoginForm } from './components/DarkstoreAdmin/DarkstoreAdminLogin';
import { Layout } from './components/Layout';

// Import all pages
import DashboardPage from './pages/Dashboard';
import OrdersPage from './pages/Orders';
import ProductsPage from './pages/Products';
import BannerPage from './pages/Banner';
import CategoryPage from './pages/Category';
import RidersPage from './pages/Riders';
import ProfilePage from './pages/Profile';
import AllusersPage from './pages/Allusers';
import InventoryPage from './pages/Inventory';

import { RegistrationVerification } from './components/RegisterInBackend';
import GlobalNotificationService from './components/GlobalNotificationService';
import { useLocation } from './hooks/useLocation';
import { LocationError } from './components/LocationError';

// Define ProtectedRoute component
import type { ReactNode, FC } from 'react';

interface RouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<RouteProps> = ({ children }) => (
  <>
    <SignedIn>{children}</SignedIn>
    <SignedOut>
      <Navigate to="/login" replace />
    </SignedOut>
  </>
);

const PublicRoute: FC<RouteProps> = ({ children }) => (
  <>
    <SignedOut>{children}</SignedOut>
    <SignedIn>
      <Navigate to="/" replace />
    </SignedIn>
  </>
);

function App() {
  const { error, requestLocation } = useLocation();

  // Don't block app loading for location errors in production
  const shouldBlockForLocation = error && import.meta.env.DEV;

  // For debugging in production
  console.log('Environment check:', {
    hasClerkKey: !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    env: import.meta.env.MODE,
    locationError: !!error
  });

  if (!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Missing Publishable Key</h1>
          <p className="mt-4">
            Your application is missing the VITE_CLERK_PUBLISHABLE_KEY environment
            variable. Navigate to the Clerk Dashboard to find your keys:
          </p>
          <p className="mt-2">
            <a
              className="text-blue-500 underline"
              href="https://dashboard.clerk.dev/last-active?path=api-keys"
              target="_blank"
              rel="noreferrer"
            >
              https://dashboard.clerk.dev/last-active?path=api-keys
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <Router>
        <GlobalNotificationService />
        {/* Only block UI for location errors in development mode */}
        {shouldBlockForLocation ? (
          <LocationError
            message={typeof error === 'string' ? error : 'Location error occurred'}
            onRetry={requestLocation}
            onOpenSettings={() => {
              if (window.navigator.permissions) {
                window.open('chrome://settings/content/location', '_blank');
              } else {
                alert('Please enable location permissions in your browser settings.');
              }
            }}
          />
        ) : (
          <Routes>
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegistrationForm />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginForm />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RegistrationVerification>
                    <Layout />
                  </RegistrationVerification>
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="dashboard/orders" element={<OrdersPage />} />
              <Route path="dashboard/products" element={<ProductsPage />} />
              <Route path="dashboard/banners" element={<BannerPage />} />
              <Route path="dashboard/categories" element={<CategoryPage />} />
              <Route path="dashboard/riders" element={<RidersPage />} />
              <Route path="dashboard/profile" element={<ProfilePage />} />
              <Route path="dashboard/inventory" element={<InventoryPage />} />
              <Route path="dashboard/allusers" element={<AllusersPage />} />
              {/* Catch-all route for unmatched paths within the layout */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        )}
      </Router>
    </ClerkProvider>
  );
}

export default App;