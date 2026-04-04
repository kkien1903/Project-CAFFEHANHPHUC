import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth(); // Lấy trạng thái và hàm từ context

  return (
    <header className="main-header">
      <div className="container">
        <Link to="/" className="logo">CÀ PHÊ HẠNH PHÚC</Link>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/categories">Danh mục</Link></li>
            {isAuthenticated && <li><Link to="/cart">Giỏ hàng</Link></li>}
            
            {isAuthenticated ? (
              <>
                <li><span>Chào, {user?.username}</span></li>
                <li><button onClick={logout} className="logout-button">Đăng xuất</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Đăng nhập</Link></li>
                <li><Link to="/register">Đăng ký</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
