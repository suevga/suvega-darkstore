import React, { useEffect } from 'react'
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut,
} from '@clerk/clerk-react'
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate 
} from 'react-router-dom'

import RegistrationForm from './components/DarkstoreAdmin/DarkstoreAdminRegister.jsx';
import { LoginForm } from './components/DarkstoreAdmin/DarkstoreAdminLogin.jsx';
import { Layout } from './components/Layout.jsx'

// Import all pages
import DashboardPage from './pages/Dashboard.jsx'
import OrdersPage from './pages/Orders.jsx'
import ProductsPage from './pages/Products.jsx'
import BannerPage from './pages/Banner.jsx';
import CategoryPage from './pages/Category.jsx';
import RidersPage from './pages/Riders.jsx';
import ProfilePage from './pages/Profile.jsx'
import AllusersPage from './pages/Allusers.jsx';
import InventoryPage from './pages/Inventory.jsx';

import { RegistrationVerification } from './components/RegisterInBackend.jsx';
import { useGoogleLocation } from './hooks/useLocation.js';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const ProtectedRoute = ({ children }) => {
  
  return (
    <>
      <SignedIn>
        <RegistrationVerification>
          {children}
        </RegistrationVerification>
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
};

const PublicRoute = ({ children }) => {
  return (
    <>
      <SignedOut>{children}</SignedOut>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
    </>
  );
};

function App() {
  const { latitude, longitude, requestLocation } = useGoogleLocation();
  console.log("latitude in app.js::", latitude);
  console.log("longitude in app.js::", longitude);
  
  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <SignedIn>
                <Navigate to="/dashboard" replace />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          } />

          <Route path="/signup" element={
            <PublicRoute>
              <RegistrationForm />
            </PublicRoute>
          } />

          <Route path="/login" element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductsPage/>} />
            <Route path="users" element={<AllusersPage />} />
            <Route path="banners" element={<BannerPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="riders" element={<RidersPage />} />
            <Route path='inventory' element={<InventoryPage/>}/>
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={
            <SignedIn>
              <Navigate to="/dashboard" replace />
            </SignedIn>
          } />
        </Routes>
      </Router>
    </ClerkProvider>
  )
}

export default App

