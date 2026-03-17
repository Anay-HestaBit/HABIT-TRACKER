import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages (to be implemented)
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import World from './pages/World';
import Progress from './pages/Progress';
import Achievements from './pages/Achievements';
import Reflections from './pages/Reflections';
import UserGuide from './pages/UserGuide';
import Settings from './pages/Settings';
import Landing from './pages/Landing';

function App() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

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

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
