import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './lib/store';
import { useAuth } from '../ecommerce/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { BeatLoader } from 'react-spinners';

const Login = React.lazy(() => import('./pages/Login'));
const AdminLayout = React.lazy(() => import('./AdminLayout'));
const AdminDashboardStats = React.lazy(() => import('./pages/AdminDashboardStats'));
const AdminProducts = React.lazy(() => import('./pages/AdminProducts'));
const AdminOrders = React.lazy(() => import('./pages/AdminOrders'));
const AdminCustomers = React.lazy(() => import('./pages/AdminCustomers'));
const AdminCertificates = React.lazy(() => import('./pages/AdminCertificates'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BeatLoader color="#1E40AF" size={15} />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function Admin_App() {
  return (
    <AnimatePresence mode="wait">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <BeatLoader color="#1E40AF" size={15} />
          </div>
        }
      >
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboardStats />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/:id" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="certificates" element={<AdminCertificates />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default Admin_App;
