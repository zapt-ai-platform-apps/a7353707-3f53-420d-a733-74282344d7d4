import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/modules/auth/context/AuthContext';
import Layout from '@/modules/core/components/Layout';
import ProtectedRoute from '@/modules/core/components/ProtectedRoute';
import ZaptBadge from '@/modules/core/components/ZaptBadge';

// Pages
import HomePage from '@/modules/core/pages/HomePage';
import ScanPage from '@/modules/scanning/pages/ScanPage';
import ProductAnalysisPage from '@/modules/scanning/pages/ProductAnalysisPage';
import HistoryPage from '@/modules/scanning/pages/HistoryPage';
import BlogListPage from '@/modules/blog/pages/BlogListPage';
import BlogPostPage from '@/modules/blog/pages/BlogPostPage';
import LoginPage from '@/modules/auth/pages/LoginPage';
import RegisterPage from '@/modules/auth/pages/RegisterPage';
import ProfilePage from '@/modules/auth/pages/ProfilePage';
import PrivacyPage from '@/modules/core/pages/PrivacyPage';
import TermsPage from '@/modules/core/pages/TermsPage';
import NotFoundPage from '@/modules/core/pages/NotFoundPage';

const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          
          {/* Protected routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Dynamic routes */}
          <Route path="/product/:id" element={<ProductAnalysisPage />} />
          
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
      <ZaptBadge />
    </AuthProvider>
  );
};

export default App;