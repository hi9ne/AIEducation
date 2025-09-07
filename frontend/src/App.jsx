import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
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
                element={!isAuthenticated ? <HomePage /> : <Navigate to="/app/dashboard" replace />} 
              />
              <Route 
                path="/login" 
                element={!isAuthenticated ? <LoginPage /> : <Navigate to="/app/dashboard" replace />} 
              />
              <Route 
                path="/register" 
                element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/app/dashboard" replace />} 
              />
            </Route>

            {/* Protected routes under /app prefix */}
            <Route path="/app" element={<PrivateLayout />}>
              <Route 
                path="dashboard" 
                element={<DashboardPage />} 
              />
              <Route 
                path="profile" 
                element={<ProfilePage />} 
              />
            </Route>
          </Routes>
        </ModalsProvider>
      </div>
    </Router>
  );
}

export default App;
