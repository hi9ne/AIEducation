import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useAuth } from './shared/hooks/useAuth';
import HomePage from './landing/pages/HomePage';
import LoginPage from './landing/pages/LoginPage';
import RegisterPage from './landing/pages/RegisterPage';
import DashboardPage from './dashboard/pages/DashboardPage';
import ProfilePage from './dashboard/pages/ProfilePage';
import UserProfileForm from './dashboard/components/Onboarding/UserProfileForm';
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="App">
        <Notifications />
        <ModalsProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route 
                path="/" 
                element={<HomePage />} 
              />
              <Route 
                path="/login" 
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/app/dashboard" replace />} 
              />
              <Route 
                path="/register" 
                element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/app/onboarding" replace />} 
              />
            </Route>

            {/* Protected routes under /app prefix */}
            <Route path="/app" element={<PrivateLayout />}>
              <Route 
                path="onboarding" 
                element={<UserProfileForm />} 
              />
              <Route 
                path="dashboard" 
                element={<DashboardPage />} 
              />
              <Route 
                path="profile" 
                element={<ProfilePage />} 
              />
            </Route>

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ModalsProvider>
      </div>
    </Router>
  );
}

export default App;
