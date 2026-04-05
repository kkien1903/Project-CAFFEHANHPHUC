import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // Hiển thị trạng thái tải trong lúc kiểm tra thông tin user
  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  // Nếu chưa đăng nhập hoặc không phải admin -> Đẩy về trang chủ
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;