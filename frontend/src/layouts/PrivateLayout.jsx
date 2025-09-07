import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';

const PrivateLayout = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main>
      <Outlet />
    </main>
  );
};

export default PrivateLayout;
