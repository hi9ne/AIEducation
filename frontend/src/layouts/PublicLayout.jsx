import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderComponent from '../components/Home/Header';

const PublicLayout = () => {
  return (
    <>
      <HeaderComponent />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;
