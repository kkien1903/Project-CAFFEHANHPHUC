import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import './Admin.css';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminStatistics from './AdminStatistics';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { logout } = useAuth();

  return (
    <div className="admin-container">
      <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <h3>Quản Trị</h3>
        <nav>
          <ul>
            <li><Link to="/admin/statistics">Thống kê</Link></li>
            <li><Link to="/admin/categories">Danh mục</Link></li>
            <li><Link to="/admin/orders">Đơn hàng</Link></li>
            <li><Link to="/admin/products">Sản phẩm</Link></li>
          </ul>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
          <Link to="/" style={{ display: 'block', padding: '12px 15px', color: '#006a31', fontWeight: 'bold', textDecoration: 'none', marginBottom: '10px', borderRadius: '4px', border: '1px solid #006a31', textAlign: 'center', transition: 'all 0.2s' }}>🏠 Về trang chủ</Link>
          <button onClick={logout} style={{ width: '100%', padding: '12px 15px', background: '#fdeaea', color: '#d62828', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>Đăng xuất</button>
        </div>
      </aside>
      <main className="admin-content">
        <Routes>
          <Route path="/" element={<AdminStatistics />} />
          <Route path="/statistics" element={<AdminStatistics />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/products" element={<AdminProducts />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;