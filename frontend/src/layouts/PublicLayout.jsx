import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderComponent from '../landing/components/Home/Header';

const PublicLayout = () => {
  const location = useLocation();
  const hideHeader = location.pathname === '/login' || location.pathname === '/register';
  return (
    <>
      {!hideHeader && <HeaderComponent />}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;