import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './Admin.css';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';

const AdminDashboard = () => {
  const DashboardHome = () => (
    <div>
      <h2>Bảng điều khiển (Dashboard)</h2>
      <p>Chào mừng đến với trang quản trị. Chọn một mục từ menu bên trái hoặc sử dụng các lối tắt bên dưới.</p>
      <div className="dashboard-shortcuts" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <Link to="products" className="btn-submit">
          Quản lý Sản phẩm
        </Link>
        <Link to="categories" className="btn-submit">
          Quản lý Danh mục
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <h3>Quản Trị</h3>
        <nav>
          <ul>
            <li><Link to="/admin">Tổng quan</Link></li>
            <li><Link to="/admin/categories">Danh mục</Link></li>
            <li><Link to="/admin/orders">Đơn hàng</Link></li>
            <li><Link to="/admin/products">Sản phẩm</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="admin-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/orders" element={<h2>Quản lý Đơn hàng (Đang phát triển)</h2>} />
          <Route path="/products" element={<AdminProducts />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;