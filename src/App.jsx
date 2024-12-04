import React from 'react'
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut,
  useUser, 
} from '@clerk/clerk-react'
import { 
  BrowserRouter as Router, 
  Route, 
  Routes, 
  Navigate 
} from 'react-router-dom'

// Import your components
import RegistrationForm from './components/DarkstoreAdmin/DarkstoreAdminRegister.jsx';
import { LoginForm } from './components/DarkstoreAdmin/DarkstoreAdminLogin.jsx';
import { Layout } from './components/Layout.jsx'

// all pages import 
import DashboardPage from './pages/Dashboard.jsx'
import OrdersPage from './pages/Orders.jsx'
import ProductsPage from './pages/Products.jsx'
import BannerPage from './pages/Banner.jsx';
import CategoryPage from './pages/Category.jsx';
import RidersPage from './pages/Riders.jsx';
import ProfilePage from './pages/Profile.jsx'
import AllusersPage from './pages/Allusers.jsx';

import { useUserStore } from './store/userStore.js';
import { RegistrationVerification } from './components/RegisterInBackend.jsx';

// Retrieve Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Enhanced Protected Route Component
const ProtectedRoute = ({ children }) => {

  const { darkstoreRegistered } = useUserStore();
  console.log("darkstoreRegistered: " + darkstoreRegistered);
  
  return (
    <>
      <SignedIn>
        { darkstoreRegistered ? children : <RegistrationVerification/>}
      </SignedIn>
      <SignedOut>
        <Navigate to="/login" replace />
      </SignedOut>
    </>
  );
};

// Optional: Wrapper for public routes that prevent logged-in users from accessing
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
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <Router>
        <Routes>
          {/* Root route with authentication check */}
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

          {/* Public Registration Route with protection */}
          <Route path="/signup" element={
            <PublicRoute>
              <RegistrationForm />
            </PublicRoute>
          } />

          {/* Clerk Sign In Route */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } />

          {/* Protected Dashboard Routes */}
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
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Optional: 404 or Catch-all Route */}
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

