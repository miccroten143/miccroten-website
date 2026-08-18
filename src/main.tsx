import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import App from './App';
import Admin_App from './Admin/Admin_App';
import { AuthProvider } from './ecommerce/AuthContext';
import { ErrorBoundary } from './ecommerce/components/ErrorBoundary';
import CheckEmail from './ecommerce/pages/CheckEmail';
import AuthCallback from "./ecommerce/pages/AuthCallback";
import VerifyCertificate from "./ecommerce/pages/VerifyCertificate";

import './index.css';

// Lazy imports
const LazyShop = React.lazy(() => import('./ecommerce/pages/ShopPage'));
const LazyCategory = React.lazy(() => import('./ecommerce/pages/CategoryPage'));
const LazyProduct = React.lazy(() => import('./ecommerce/pages/ProductDetailPage'));
const LazyCart = React.lazy(() => import('./ecommerce/pages/CartPage'));
const LazyCheckout = React.lazy(() => import('./ecommerce/pages/CheckoutPage'));
const LazyOrders = React.lazy(() => import('./ecommerce/pages/OrdersPage'));
const LazyProfile = React.lazy(() => import('./ecommerce/pages/ProfilePage'));
const LazyWishlist = React.lazy(() => import('./ecommerce/pages/WishlistPage'));
const LazyLogin = React.lazy(() => import('./ecommerce/pages/LoginPage'));
const LazySignup = React.lazy(() => import('./ecommerce/pages/SignupPage'));
const LazyForgotPassword = React.lazy(() => import('./ecommerce/pages/ForgotPasswordPage'));
const LazyPrivacyPolicy = React.lazy(() => import('./ecommerce/pages/PrivacyPolicyPage'));
const LazyTerms = React.lazy(() => import('./ecommerce/pages/TermsPage'));
const LazyRefundPolicy = React.lazy(() => import('./ecommerce/pages/RefundPolicyPage'));
const LazyCancellationPolicy = React.lazy(() => import('./ecommerce/pages/CancellationPolicyPage'));
const LazyCertificateVerification = React.lazy(() => import('./ecommerce/pages/CertificateVerificationPage'));

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/shop" element={<LazyShop />} />
            <Route path="/category/:slug" element={<LazyCategory />} />
            <Route path="/check-email" element={<CheckEmail />} />
            <Route path="/product/:id" element={<LazyProduct />} />
            <Route path="/cart" element={<LazyCart />} />
            <Route path="/checkout" element={<LazyCheckout />} />
            <Route path="/orders" element={<LazyOrders />} />
            <Route path="/orders/:id" element={<LazyOrders />} />
            <Route path="/profile" element={<LazyProfile />} />
            <Route path="/wishlist" element={<LazyWishlist />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/login" element={<LazyLogin />} />
            <Route path="/signup" element={<LazySignup />} />
            <Route path="/forgot-password" element={<LazyForgotPassword />} />
            <Route path="/privacy-policy" element={<LazyPrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<LazyTerms />} />
            <Route path="/refund-policy" element={<LazyRefundPolicy />} />
            <Route path="/cancellation-policy" element={<LazyCancellationPolicy />} />
            <Route path="/verify" element={<LazyCertificateVerification />} />
            <Route
              path="/verify"
              element={<VerifyCertificate />}
            />
            <Route path="/admin/*" element={<Admin_App />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '8px',
          },
        }}
      />
    </AuthProvider>
  </ErrorBoundary>
);