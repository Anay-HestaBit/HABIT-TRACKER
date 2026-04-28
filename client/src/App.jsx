import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastViewport from './components/ToastViewport';

const TourRunner = lazy(() => import('./components/TourRunner'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Habits = lazy(() => import('./pages/Habits'));
const World = lazy(() => import('./pages/World'));
const Progress = lazy(() => import('./pages/Progress'));
const Achievements = lazy(() => import('./pages/Achievements'));
const Reflections = lazy(() => import('./pages/Reflections'));
const UserGuide = lazy(() => import('./pages/UserGuide'));
const Settings = lazy(() => import('./pages/Settings'));
const Landing = lazy(() => import('./pages/Landing'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Community = lazy(() => import('./pages/Community'));
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'));
const CommunityChat = lazy(() => import('./pages/CommunityChat'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
  </div>
);

function App() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      <Suspense fallback={null}>
        <TourRunner />
      </Suspense>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute>
            <Layout><Habits /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/world" element={
          <ProtectedRoute>
            <Layout><World /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/progress" element={
          <ProtectedRoute>
            <Layout><Progress /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/achievements" element={
          <ProtectedRoute>
            <Layout><Achievements /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reflections" element={
          <ProtectedRoute>
            <Layout><Reflections /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/guide" element={
          <ProtectedRoute>
            <Layout><UserGuide /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/community" element={
          <ProtectedRoute>
            <Layout><Community /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/community/:id" element={
          <ProtectedRoute>
            <Layout><CommunityDetail /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/community/:id/chat" element={
          <ProtectedRoute>
            <Layout><CommunityChat /></Layout>
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ToastViewport />
    </>
  );
}

export default App;
