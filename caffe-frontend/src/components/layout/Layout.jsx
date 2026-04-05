import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Nếu là trang Admin, không bọc Header, Footer và thẻ main container
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="container">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;