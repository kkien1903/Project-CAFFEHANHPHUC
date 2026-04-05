import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Lấy trạng thái và hàm từ context

  return (
    <header className="main-header">
      <div className="container">
        <Link to="/" className="logo">CÀ PHÊ HẠNH PHÚC</Link>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Trang chủ</NavLink></li>
            <li><NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>Sản phẩm</NavLink></li>
            <li><NavLink to="/categories" className={({ isActive }) => isActive ? "active" : ""}>Danh mục</NavLink></li>
            {isAuthenticated && <li><NavLink to="/cart" className={({ isActive }) => isActive ? "active" : ""}>Giỏ hàng</NavLink></li>}
            
            {isAuthenticated ? (
              <>
                <li><span>Chào, {user?.username}</span></li>
                <li><button onClick={logout} className="logout-button">Đăng xuất</button></li>
              </>
            ) : (
              <>
                <li><NavLink to="/login" className={({ isActive }) => isActive ? "active" : ""}>Đăng nhập</NavLink></li>
                <li><NavLink to="/register" className={({ isActive }) => isActive ? "active" : ""}>Đăng ký</NavLink></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
